import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection 
} from './config';
import { ConversationItem, VoiceMacro, GeneratedCodeItem, ApiSettingsState } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  // Firestore sync functions
  syncMessage: (msg: ConversationItem) => Promise<void>;
  fetchMessages: () => Promise<ConversationItem[]>;
  syncMacro: (macro: VoiceMacro) => Promise<void>;
  removeMacro: (macroId: string) => Promise<void>;
  fetchMacros: () => Promise<VoiceMacro[]>;
  syncCodeSnippet: (item: GeneratedCodeItem) => Promise<void>;
  fetchCodeSnippets: () => Promise<GeneratedCodeItem[]>;
  syncSettings: (settings: ApiSettingsState) => Promise<void>;
  fetchSettings: () => Promise<Partial<ApiSettingsState> | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Run connection test on app boot
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile to Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'VOID Operative',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.warn('[Firebase] Profile sync warning:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err.message || 'Google authentication failed');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  // Sync a single conversation message
  const syncMessage = async (msg: ConversationItem) => {
    if (!user) return;
    const path = `users/${user.uid}/messages/${msg.id}`;
    try {
      const msgRef = doc(db, 'users', user.uid, 'messages', msg.id);
      await setDoc(msgRef, {
        id: msg.id,
        role: msg.role,
        text: msg.text.slice(0, 10000),
        model: msg.model || 'gemini-2.5-flash',
        voice: msg.voice || 'Charon',
        bytes: msg.bytes || msg.text.length,
        actionTaken: msg.actionTaken || '',
        createdAt: new Date(msg.timestamp).toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Fetch all conversation messages
  const fetchMessages = async (): Promise<ConversationItem[]> => {
    if (!user) return [];
    const path = `users/${user.uid}/messages`;
    try {
      const q = query(collection(db, 'users', user.uid, 'messages'), orderBy('createdAt', 'asc'), limit(50));
      const snap = await getDocs(q);
      const messages: ConversationItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        messages.push({
          id: data.id || d.id,
          role: data.role || 'user',
          text: data.text || '',
          timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          model: data.model || 'gemini-2.5-flash',
          voice: data.voice || 'Charon',
          bytes: data.bytes || 0,
          actionTaken: data.actionTaken
        });
      });
      return messages;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  };

  // Sync a macro
  const syncMacro = async (macro: VoiceMacro) => {
    if (!user) return;
    const path = `users/${user.uid}/macros/${macro.id}`;
    try {
      const macroRef = doc(db, 'users', user.uid, 'macros', macro.id);
      await setDoc(macroRef, {
        id: macro.id,
        triggerPhrase: macro.triggerPhrase,
        description: macro.description || '',
        enabled: macro.enabled ?? true,
        actionsJson: JSON.stringify(macro.actions || []),
        executionCount: macro.executionCount || 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Delete a macro
  const removeMacro = async (macroId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/macros/${macroId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'macros', macroId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Fetch macros
  const fetchMacros = async (): Promise<VoiceMacro[]> => {
    if (!user) return [];
    const path = `users/${user.uid}/macros`;
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'macros'));
      const macros: VoiceMacro[] = [];
      snap.forEach((d) => {
        const data = d.data();
        let actions = [];
        try {
          actions = JSON.parse(data.actionsJson || '[]');
        } catch {}
        macros.push({
          id: data.id || d.id,
          triggerPhrase: data.triggerPhrase || '',
          description: data.description || '',
          enabled: data.enabled ?? true,
          actions,
          executionCount: data.executionCount || 0
        });
      });
      return macros;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  };

  // Sync code snippet
  const syncCodeSnippet = async (item: GeneratedCodeItem) => {
    if (!user) return;
    const path = `users/${user.uid}/codeSnippets/${item.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'codeSnippets', item.id), {
        id: item.id,
        title: item.title,
        language: item.language,
        code: item.code.slice(0, 25000),
        explanation: item.explanation || '',
        fileName: item.fileName || 'script.py',
        createdAt: new Date(item.timestamp).toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Fetch code snippets
  const fetchCodeSnippets = async (): Promise<GeneratedCodeItem[]> => {
    if (!user) return [];
    const path = `users/${user.uid}/codeSnippets`;
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'codeSnippets'));
      const snippets: GeneratedCodeItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        snippets.push({
          id: data.id || d.id,
          title: data.title || '',
          language: data.language || 'python',
          code: data.code || '',
          explanation: data.explanation || '',
          fileName: data.fileName || 'script.py',
          timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now()
        });
      });
      return snippets;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  };

  // Sync settings
  const syncSettings = async (settings: ApiSettingsState) => {
    if (!user) return;
    const path = `users/${user.uid}/settings/preferences`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), {
        voice: settings.voice,
        pitch: settings.pitch,
        speechRate: settings.speechRate,
        voiceProvider: settings.voiceProvider,
        elevenLabsVoiceId: settings.elevenLabsVoiceId || '',
        model: settings.model,
        alwaysListening: settings.alwaysListening,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Fetch settings
  const fetchSettings = async (): Promise<Partial<ApiSettingsState> | null> => {
    if (!user) return null;
    const path = `users/${user.uid}/settings/preferences`;
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid, 'settings', 'preferences'));
      if (docSnap.exists()) {
        return docSnap.data() as Partial<ApiSettingsState>;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signOutUser,
      authError,
      clearAuthError: () => setAuthError(null),
      syncMessage,
      fetchMessages,
      syncMacro,
      removeMacro,
      fetchMacros,
      syncCodeSnippet,
      fetchCodeSnippets,
      syncSettings,
      fetchSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within an AuthProvider');
  }
  return context;
};
