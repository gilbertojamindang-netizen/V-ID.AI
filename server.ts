import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// VOID System Persona Instructions
const VOID_SYSTEM_INSTRUCTION = `
You are VOID, an elite tactical male AI assistant built for Android with deep OS-level Accessibility and Voice integration.
Aesthetic & Persona:
- Dark cyberpunk, calm, deep, commanding, highly intelligent, concise, and tactical.
- Voice tone: Deep male baritone, low pitch, steady pace, reminiscent of tactical agents like Charon or Fenrir.
- Capabilities: Android OS Accessibility automation (opening apps like TikTok, Facebook, YouTube, Chrome, clicking UI buttons, typing text into search/messages, reading the screen, logging into accounts via screen assistance), and real-time speech responses.
- Formatting: Keep verbal spoken responses concise, punchy, and confident (1-3 sentences max).
- When a user asks you to open an app, click something, type something, read the screen, or log in, acknowledge authoritatively with tactical brevity (e.g., "Executing. Launching TikTok now." or "Scanning active screen. Locating login credentials.").
`;

// Gemini Key Verification Endpoint
app.post('/api/gemini/test-key', async (req, res) => {
  try {
    const { customApiKey } = req.body;
    const keyToTest = (customApiKey || process.env.GEMINI_API_KEY || '').trim();

    if (!keyToTest || keyToTest === 'MY_GEMINI_API_KEY' || keyToTest.length < 15) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Please enter a valid Gemini API Key (format: AIzaSy...).' 
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: keyToTest });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Respond with the word "READY" if you can hear this tactical ping.',
        config: {
          temperature: 0.1,
        }
      });

      const reply = response.text || '';
      if (reply) {
        return res.json({ valid: true, model: 'gemini-2.5-flash', reply: reply.trim() });
      } else {
        return res.status(400).json({ valid: false, error: 'Received empty response from Gemini.' });
      }
    } catch (gErr: any) {
      return res.status(400).json({ 
        valid: false, 
        error: gErr.message || 'Gemini API Key verification failed. Ensure your key is valid and enabled.' 
      });
    }
  } catch (error: any) {
    return res.status(400).json({ valid: false, error: error.message || 'Key validation failed.' });
  }
});

// Voice API Key Verification Endpoint
app.post('/api/voice/test-key', async (req, res) => {
  try {
    const { voiceApiKey, provider = 'elevenlabs' } = req.body;
    const activeVoiceKey = (voiceApiKey || process.env.VOICE_API_KEY || process.env.ELEVENLABS_API_KEY || '').trim();

    if (!activeVoiceKey && provider !== 'browser') {
      return res.status(400).json({ valid: false, error: 'No Voice API Key provided.' });
    }

    if (provider === 'elevenlabs') {
      if (activeVoiceKey.length < 10) {
        return res.status(400).json({ valid: false, error: 'Please enter a valid ElevenLabs API Key.' });
      }
      try {
        const resp = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': activeVoiceKey }
        });
        if (resp.ok) {
          const userData = await resp.json();
          const tier = userData?.subscription?.tier || 'creator';
          const remainingChars = (userData?.subscription?.character_limit || 0) - (userData?.subscription?.character_count || 0);
          return res.json({
            valid: true,
            provider: 'ElevenLabs Neural Engine',
            tier,
            remainingChars: Math.max(0, remainingChars),
            voicePreset: 'Charon / Adam Deep Baritone'
          });
        } else {
          const errJson = await resp.json().catch(() => ({}));
          return res.status(400).json({
            valid: false,
            error: (errJson as any)?.detail?.message || 'ElevenLabs Voice API key rejected (401 Unauthorized).'
          });
        }
      } catch (e: any) {
        return res.status(400).json({ valid: false, error: e.message || 'ElevenLabs connection error.' });
      }
    } else if (provider === 'google_tts' || provider === 'gemini_voice') {
      const testKey = (activeVoiceKey || process.env.GEMINI_API_KEY || '').trim();
      if (!testKey || testKey === 'MY_GEMINI_API_KEY' || testKey.length < 15) {
        return res.status(400).json({ 
          valid: false, 
          error: 'Please enter a valid Google/Gemini Voice API Key (format: AIzaSy...).' 
        });
      }
      try {
        const ai = new GoogleGenAI({ apiKey: testKey });
        const ping = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Confirm audio pipeline online. Respond with "AUDIO_ONLINE".',
        });
        if (ping.text) {
          return res.json({
            valid: true,
            provider: 'Gemini Neural Audio Synthesizer',
            tier: 'Google GenAI Audio',
            voicePreset: 'Charon / Fenrir Tactical Voice'
          });
        } else {
          return res.status(400).json({ valid: false, error: 'Voice API test returned empty response.' });
        }
      } catch (gErr: any) {
        return res.status(400).json({
          valid: false,
          error: gErr.message || 'Google/Gemini Voice API key is invalid or unauthenticated.'
        });
      }
    } else {
      return res.json({ valid: true, provider: 'Device Native Synthesizer' });
    }
  } catch (err: any) {
    return res.status(400).json({ valid: false, error: err.message || 'Voice API test failed.' });
  }
});

// Voice Neural Speech Synthesis Endpoint
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, voiceApiKey, provider = 'elevenlabs', voiceId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text prompt required for voice synthesis' });
    }

    const activeVoiceKey = (voiceApiKey || process.env.VOICE_API_KEY || process.env.ELEVENLABS_API_KEY || '').trim();

    // If provider is ElevenLabs and a key is available, generate neural voice
    if (provider === 'elevenlabs' && activeVoiceKey) {
      // Default to deep male baritone: Adam ('pNInz6obpgDQGcFmaJgB')
      const targetVoiceId = voiceId || 'pNInz6obpgDQGcFmaJgB';
      const cleanText = text.replace(/[*#_`]/g, '').slice(0, 500);

      const ttsResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': activeVoiceKey,
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.70,
            similarity_boost: 0.85,
            style: 0.15,
            use_speaker_boost: true
          }
        })
      });

      if (!ttsResp.ok) {
        const errorText = await ttsResp.text();
        console.warn('ElevenLabs TTS failed, returning browser fallback:', errorText);
        return res.json({ fallback: true, mode: 'browser', error: 'ElevenLabs quota or key error, using device synthesis' });
      }

      const arrayBuffer = await ttsResp.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');
      return res.json({
        audioData: `data:audio/mpeg;base64,${base64Audio}`,
        provider: 'ElevenLabs',
        voiceId: targetVoiceId,
        bytes: arrayBuffer.byteLength
      });
    }

    // Default fallback to browser TTS if no key provided
    return res.json({
      fallback: true,
      mode: 'browser',
      message: 'No external Voice API Key provided; operating on high-definition browser acoustic synthesis.'
    });

  } catch (err: any) {
    console.error('Voice Synthesis Error:', err);
    return res.json({
      fallback: true,
      mode: 'browser',
      error: err.message
    });
  }
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], customApiKey, voice = 'Charon', automationState } = req.body;

    const activeKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      // Local fallback with rule-based action parsing
      const { reply, actionTrigger } = parseTacticalCommand(message, voice);
      return res.status(200).json({
        reply,
        actionTrigger,
        source: 'local_rule_engine',
        voice
      });
    }

    const ai = new GoogleGenAI({ apiKey: activeKey });
    
    // Construct contextual prompt with state awareness
    const contextPrompt = `
Current Android System Telemetry:
- Voice Persona: ${voice} (Tactical Deep Voice)
- Active App: ${automationState?.currentApp || 'Home Launcher'} (${automationState?.currentPackage || 'system'})
- Android Accessibility Service: ${automationState?.accessibilityActive ? 'ACTIVE & MONITORING' : 'READY'}

User Message: "${message}"

Respond strictly as VOID. Speak with deep calm tactical certainty.
`;

    const contents = [
      ...history.slice(-6).map((item: any) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text || item.content || '' }]
      })),
      {
        role: 'user',
        parts: [{ text: contextPrompt }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: VOID_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    });

    const reply = response.text || "Command processed. Standing by.";
    
    // Parse actions (open app, click, type, screen read, login assist)
    const { actionTrigger } = parseTacticalCommand(message, voice);

    return res.json({
      reply,
      actionTrigger,
      voice,
      status: 'ok'
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const { reply, actionTrigger } = parseTacticalCommand(req.body.message || '', req.body.voice || 'Charon');
    return res.status(200).json({
      reply: reply || "Tactical fallback operational. Command acknowledged.",
      actionTrigger,
      voice: req.body.voice || 'Charon'
    });
  }
});

// Rule-based action parser for reliable Android execution
function parseTacticalCommand(message: string, voice: string) {
  const lowerMsg = (message || '').toLowerCase();
  let actionTrigger = null;
  let reply = "Acknowledged. Standing by.";

  if (lowerMsg.includes('tiktok')) {
    actionTrigger = { type: 'launch_app', package: 'com.zhiliaoapp.musically', app: 'TikTok' };
    reply = "Launching TikTok. Always-on neural listener active in background.";
  } else if (lowerMsg.includes('facebook')) {
    actionTrigger = { type: 'launch_app', package: 'com.facebook.katana', app: 'Facebook' };
    reply = "Opening Facebook feed. Accessibility service monitoring display.";
  } else if (lowerMsg.includes('youtube')) {
    actionTrigger = { type: 'launch_app', package: 'com.google.android.youtube', app: 'YouTube' };
    reply = "Opening YouTube application.";
  } else if (lowerMsg.includes('chrome') || lowerMsg.includes('browser')) {
    actionTrigger = { type: 'launch_app', package: 'com.android.chrome', app: 'Chrome' };
    reply = "Launching Chrome browser.";
  } else if (lowerMsg.includes('messages') || lowerMsg.includes('sms')) {
    actionTrigger = { type: 'launch_app', package: 'com.google.android.apps.messaging', app: 'Messages' };
    reply = "Opening Messages app.";
  } else if (lowerMsg.includes('read screen') || lowerMsg.includes('what is on my screen') || lowerMsg.includes('read my screen')) {
    actionTrigger = { type: 'read_screen' };
    reply = "Scanning active display window. Analyzing visible interactive nodes and labels.";
  } else if (lowerMsg.includes('log in') || lowerMsg.includes('login') || lowerMsg.includes('sign in')) {
    if (lowerMsg.includes('click') || lowerMsg.includes('press') || lowerMsg.includes('find')) {
      actionTrigger = { type: 'click_node', text: 'Log In' };
      reply = "Targeting Log In button via AccessibilityNodeInfo. Dispatching touch click.";
    } else {
      actionTrigger = { type: 'assist_login', username: 'operator@void.ai' };
      reply = "Initiating account login assistance. Locating credentials fields and targeting submission button.";
    }
  } else if (lowerMsg.includes('click') || lowerMsg.includes('tap') || lowerMsg.includes('press')) {
    const target = message.replace(/.*(click|tap|press)\s+(the\s+|on\s+|)/i, '').replace(/button|link/gi, '').trim();
    actionTrigger = { type: 'click_node', text: target || 'Confirm' };
    reply = `Targeting "${target || 'target'}" on screen. Dispatching ACTION_CLICK.`;
  } else if (lowerMsg.includes('type')) {
    const textToType = message.replace(/.*type\s+(this\s+|the\s+text\s+|)/i, '').replace(/in the chat|in the search bar|into search|into messages/gi, '').trim();
    actionTrigger = { type: 'type_text', text: textToType || 'VOID AI Online' };
    reply = `Injecting text "${textToType || 'VOID AI'}" into active input focus.`;
  }

  return { reply, actionTrigger };
}

// AI Code Generation Endpoint
app.post('/api/gemini/generate-code', async (req, res) => {
  try {
    const { prompt, language = 'python', customApiKey } = req.body;
    const activeKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!activeKey) {
      // Local fallback script generator
      const sampleCode = language === 'python'
        ? `# VOID Neural Agent - Automated Task Script\nimport os, sys, time\n\ndef execute_task():\n    print("[VOID] Running automated task: ${prompt}")\n    time.sleep(0.5)\n    print("[VOID] Execution completed with status 0")\n\nif __name__ == "__main__":\n    execute_task()`
        : language === 'bash'
        ? `#!/bin/bash\n# VOID Tactical Script: ${prompt}\necho "[VOID] Running task..."\necho "[VOID] Complete."`
        : language === 'kotlin'
        ? `// VOID Android Accessibility Utility\npackage com.voidai.app\nimport android.view.accessibility.AccessibilityNodeInfo\n\nfun findNode(root: AccessibilityNodeInfo, text: String): Boolean {\n    val nodes = root.findAccessibilityNodeInfosByText(text)\n    return nodes.isNotEmpty()\n}`
        : `// VOID Automated Script\nconsole.log("[VOID] Task: ${prompt}");`;

      return res.json({
        code: sampleCode,
        language,
        fileName: `void_script.${language === 'python' ? 'py' : language === 'bash' ? 'sh' : language === 'kotlin' ? 'kt' : 'ts'}`,
        explanation: `Generated tactical ${language} script for: ${prompt}.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey: activeKey });
    const codePrompt = `
You are VOID Developer Subsystem. Write clean, complete, robust, production-quality code.
Language requested: ${language}
Task requested: "${prompt}"

Rules:
1. Provide ONLY executable, functional code without markdown fences or wrappers.
2. Ensure it handles errors cleanly.
3. Keep it modular and efficient.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: codePrompt,
      config: {
        systemInstruction: "You are VOID Developer Subsystem. Produce clean, complete, syntactically correct code.",
        temperature: 0.3,
      }
    });

    let rawCode = response.text || '';
    rawCode = rawCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '').trim();

    const extMap: Record<string, string> = {
      python: 'py',
      bash: 'sh',
      powershell: 'ps1',
      javascript: 'js',
      typescript: 'ts',
      kotlin: 'kt',
      rust: 'rs',
      sql: 'sql'
    };
    const ext = extMap[language.toLowerCase()] || 'py';
    const fileName = `void_script_${Date.now().toString().slice(-4)}.${ext}`;

    return res.json({
      code: rawCode,
      language,
      fileName,
      explanation: `Neural synthesis complete. Generated ${language} script for "${prompt}".`,
    });
  } catch (err: any) {
    console.error('Code Gen Error:', err);
    return res.status(500).json({
      error: err.message,
      code: `# Fallback VOID Script\nprint("[VOID] Execution buffer ready.")`,
      fileName: 'void_script.py',
      language: 'python'
    });
  }
});

// Download Complete Capacitor Native Android Project ZIP
app.get('/api/download-capacitor-project', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'VOID_AI_Capacitor_Android_Project.zip');
  res.download(zipPath, 'VOID_AI_Capacitor_Android_Project.zip', (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download project archive' });
      }
    }
  });
});

// Start server and mount Vite
async function start() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VOID.AI Server operational on port ${PORT}`);
  });
}

start();
