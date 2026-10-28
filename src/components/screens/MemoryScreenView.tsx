import React, { useState } from 'react';
import { Database, Search, Trash2, Download, RefreshCw, HardDrive, Cpu, Bot, User } from 'lucide-react';
import { ConversationItem } from '../../types';

interface MemoryScreenViewProps {
  conversations: ConversationItem[];
  onClearMemory: () => void;
  onDeleteConversation: (id: string) => void;
  totalBytesUsed: number;
}

export const MemoryScreenView: React.FC<MemoryScreenViewProps> = ({
  conversations,
  onClearMemory,
  onDeleteConversation,
  totalBytesUsed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const maxStorageBytes = 30 * 1024 * 1024; // 30 MB Room quota
  const percentUsed = Math.min(100, (totalBytesUsed / maxStorageBytes) * 100);
  const mbUsed = (totalBytesUsed / (1024 * 1024)).toFixed(2);

  const filtered = conversations.filter((c) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'void_room_database_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full h-full min-h-screen bg-black text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-display">ROOM DATABASE MEMORY</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                30 MB SQLite Cache
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Persistent Context Buffer • Room DAO Flow • Auto-Trimming Garbage Collection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/15 hover:border-cyan-400 text-xs font-mono flex items-center gap-1.5 text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Database</span>
          </button>

          <button
            onClick={onClearMemory}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-xs font-mono flex items-center gap-1.5 text-rose-300 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Memory</span>
          </button>
        </div>
      </div>

      {/* STORAGE QUOTA PROGRESS BAR (30 MB CAPACITY) */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Storage Allocation: <strong className="text-white">{mbUsed} MB</strong> / 30.00 MB</span>
          </div>
          <span className="text-cyan-400 font-bold">{percentUsed.toFixed(1)}% Quota</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-white/10 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-white rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.7)]"
            style={{ width: `${Math.max(2, percentUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
          <span>Active Table: <code>conversations_table</code> (Room DAO Entity)</span>
          <span>Indexed Conversations: {conversations.length}</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversation history or context memory..."
          className="w-full bg-zinc-950 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white font-mono placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {/* CONVERSATION HISTORY LOG */}
      <div className="flex-1 bg-zinc-950 rounded-2xl border border-white/10 p-4 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
        {filtered.length === 0 ? (
          <div className="my-auto py-12 text-center text-zinc-500 font-mono text-xs flex flex-col items-center gap-2">
            <Database className="w-8 h-8 opacity-40 text-zinc-600" />
            <span>No conversation records found in Room Database.</span>
            <span className="text-[10px] text-zinc-600">Speak to VOID on the Home screen to populate contextual memory.</span>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2 group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  {item.role === 'user' ? (
                    <span className="flex items-center gap-1 text-zinc-400 font-bold">
                      <User className="w-3.5 h-3.5 text-zinc-400" /> USER
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" /> VOID [{item.voice || 'Charon'}]
                    </span>
                  )}
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 text-[10px]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {item.bytes || item.text.length * 2} Bytes
                  </span>
                  <button
                    onClick={() => onDeleteConversation(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-opacity p-1"
                    title="Delete record from Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                {item.text}
              </p>

              {item.actionTaken && (
                <div className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded w-fit">
                  ACTION: {item.actionTaken}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
