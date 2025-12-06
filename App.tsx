import React, { useState, useEffect, useRef } from 'react';
import { User, Message, AppState, NukeType, ChatSession } from './types';
import { Button } from './components/Button';
import { MessageBubble } from './components/MessageBubble';
import { Calculator } from './components/Calculator';
import { initializeGemini, sendMessageToGemini, clearGeminiMemory } from './services/geminiService';
import { 
  Shield, 
  Trash2, 
  RefreshCw, 
  Send, 
  Lock, 
  Zap, 
  Skull, 
  Menu, 
  X,
  Fingerprint,
  Activity,
  UserPlus,
  Users,
  Search,
  LogOut
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Constants ---
const DEFAULT_CONTACT_ID = 'agent-47';

const generateIdentity = (): User => {
  const hash = Math.random().toString(36).substring(7);
  return {
    id: uuidv4(),
    username: `Ghost-${hash.substring(0, 4).toUpperCase()}`,
    publicKey: `RSA-4096-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    isAnonymous: true,
    avatarSeed: hash,
  };
};

const createInitialSession = (): ChatSession => ({
  id: uuidv4(),
  partner: {
    id: DEFAULT_CONTACT_ID,
    username: 'Agent Gemini',
    publicKey: '0x4F...1A2B',
    isAnonymous: true,
    avatarSeed: 'gemini'
  },
  messages: [
    {
      id: uuidv4(),
      senderId: 'system',
      text: 'SECURE CHANNEL ESTABLISHED. NO LOGS. E2E ENCRYPTED.',
      timestamp: Date.now(),
      encrypted: false,
      isSystem: true
    },
    {
      id: uuidv4(),
      senderId: DEFAULT_CONTACT_ID,
      text: "I'm Agent Gemini. This line is secure. What do you need to discuss?",
      timestamp: Date.now() + 100,
      encrypted: true
    }
  ],
  lastActive: Date.now(),
  unreadCount: 0
});

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP_VAULT);
  const [vaultCode, setVaultCode] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Add Friend State
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Computed active session
  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    initializeGemini();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessions, isTyping, activeSessionId]);

  const handleSetVaultCode = (code: string) => {
    if (code.length < 1) return;
    setVaultCode(code);
    setAppState(AppState.CALCULATOR);
  };

  const handleUnlockAttempt = (attempt: string) => {
    if (attempt === vaultCode) {
      setAppState(AppState.LANDING);
    }
  };

  const handleCreateAccount = () => {
    const user = generateIdentity();
    setCurrentUser(user);
    setAppState(AppState.CHATTING);
    
    // Initialize with default Agent Gemini chat
    const initialSession = createInitialSession();
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendIdInput.trim()) return;

    // Simulate adding a friend
    const newFriendName = `User-${friendIdInput.slice(0, 4)}`;
    const newSession: ChatSession = {
      id: uuidv4(),
      partner: {
        id: uuidv4(),
        username: newFriendName,
        publicKey: `RSA-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
        isAnonymous: true,
        avatarSeed: friendIdInput
      },
      messages: [
        {
          id: uuidv4(),
          senderId: 'system',
          text: `HANDSHAKE COMPLETE. CONNECTED TO ${friendIdInput.toUpperCase()}`,
          timestamp: Date.now(),
          encrypted: false,
          isSystem: true
        }
      ],
      lastActive: Date.now(),
      unreadCount: 0
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setFriendIdInput('');
    setIsAddingFriend(false);
    setIsSidebarOpen(false); // Close sidebar on mobile after adding
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !currentUser || !activeSession) return;

    const currentSessionId = activeSession.id;
    const partner = activeSession.partner;

    const newMsg: Message = {
      id: uuidv4(),
      senderId: currentUser.id,
      text: inputValue,
      timestamp: Date.now(),
      encrypted: true
    };

    // Update UI immediately
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, newMsg],
          lastActive: Date.now()
        };
      }
      return s;
    }));

    setInputValue('');
    setIsTyping(true);

    // AI Response
    try {
      const responseText = await sendMessageToGemini(partner.id, partner.username, newMsg.text);
      
      setTimeout(() => {
        const aiMsg: Message = {
          id: uuidv4(),
          senderId: partner.id,
          text: responseText,
          timestamp: Date.now(),
          encrypted: true
        };

        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMsg],
              lastActive: Date.now()
            };
          }
          return s;
        }));
        setIsTyping(false);
      }, Math.random() * 800 + 400); 
    } catch (err) {
      setIsTyping(false);
    }
  };

  const executeNuke = (type: NukeType) => {
    setAppState(AppState.NUKING);
    
    setTimeout(() => {
      if (type === 'SERVER') {
        // Clear messages for ALL sessions, but keep sessions open
        setSessions(prev => prev.map(s => ({
          ...s,
          messages: [{
            id: uuidv4(),
            senderId: 'system',
            text: 'SERVER LOGS WIPED. HISTORY CLEARED.',
            timestamp: Date.now(),
            encrypted: false,
            isSystem: true
          }]
        })));
        clearGeminiMemory();
        setAppState(AppState.CHATTING);

      } else if (type === 'LOCAL') {
        // Full Reset - Back to Vault Setup
        setCurrentUser(null);
        setSessions([]);
        setActiveSessionId(null);
        setVaultCode(null);
        clearGeminiMemory();
        setAppState(AppState.SETUP_VAULT);

      } else if (type === 'PANIC') {
        // Fast Account: New Identity, Keep Contacts, Keep History (but migrate ownership)
        const oldId = currentUser?.id;
        const newIdentity = generateIdentity();
        setCurrentUser(newIdentity);

        // Migrate existing message ownership in local view to preserve flow
        setSessions(prev => prev.map(s => ({
          ...s,
          messages: [
            ...s.messages.map(m => m.senderId === oldId ? { ...m, senderId: newIdentity.id } : m),
            {
              id: uuidv4(),
              senderId: 'system',
              text: 'IDENTITY PROTOCOL SWAPPED. NEW KEYS GENERATED.',
              timestamp: Date.now(),
              encrypted: false,
              isSystem: true
            }
          ]
        })));
        
        setAppState(AppState.CHATTING);
      }
      setIsSidebarOpen(false);
    }, 1500);
  };

  const handleLock = () => {
    setAppState(AppState.CALCULATOR);
    setIsSidebarOpen(false);
  };

  // --- RENDER STATES ---

  if (appState === AppState.SETUP_VAULT) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center text-slate-500 font-mono text-sm space-y-2">
          <p>INITIALIZING VAULT...</p>
          <p className="text-xs text-slate-600">Secure Calculator Interface</p>
        </div>
        <Calculator mode="SETUP" onSetCode={handleSetVaultCode} />
        <div className="mt-8 text-center text-xs text-slate-700 max-w-xs">
          Enter a secret PIN and press '='. <br/>This will be your entry key.
        </div>
      </div>
    );
  }

  if (appState === AppState.CALCULATOR) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Calculator mode="USAGE" onUnlockAttempt={handleUnlockAttempt} />
      </div>
    );
  }

  if (appState === AppState.LANDING) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <button 
            onClick={handleLock}
            className="absolute top-4 left-4 p-2 text-slate-600 hover:text-white transition-colors"
            title="Lock Vault"
        >
            <LogOut size={24} />
        </button>

        <div className="z-10 max-w-md w-full text-center space-y-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
              <Shield size={48} className="text-emerald-500" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold tracking-tighter text-white">
            Ghost<span className="text-emerald-500">Chat</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Zero logs. Zero trace. Ephemeral encryption.
          </p>

          <div className="space-y-4 pt-8">
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full text-lg h-14"
              onClick={handleCreateAccount}
              icon={<Zap size={20} />}
            >
              Generate Secure Identity
            </Button>
            <p className="text-xs text-slate-500 font-mono">
              *Generates 4096-bit RSA keypair. No signup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.NUKING) {
    return (
      <div className="min-h-screen bg-red-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600 mix-blend-overlay opacity-20 animate-pulse"></div>
        <div className="z-10 text-center space-y-4">
          <Skull size={80} className="text-red-500 mx-auto animate-bounce" />
          <h2 className="text-4xl font-mono font-bold text-red-500 tracking-widest uppercase">
            Protocol Omega
          </h2>
          <p className="text-red-300 font-mono">Wiping sectors...</p>
          <div className="w-64 h-2 bg-red-900 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-red-500 animate-[width_1s_ease-in-out_infinite] w-full origin-left"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-80 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm z-20">
        <SidebarContent 
          currentUser={currentUser} 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNuke={executeNuke}
          isAddingFriend={isAddingFriend}
          setIsAddingFriend={setIsAddingFriend}
          friendIdInput={friendIdInput}
          setFriendIdInput={setFriendIdInput}
          handleAddFriend={handleAddFriend}
          onLock={handleLock}
        />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-4/5 max-w-xs bg-slate-900 h-full shadow-2xl animate-[slideIn_0.3s_ease-out]">
            <SidebarContent 
              currentUser={currentUser} 
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => { setActiveSessionId(id); setIsSidebarOpen(false); }}
              onNuke={executeNuke}
              isMobile
              closeMobile={() => setIsSidebarOpen(false)}
              isAddingFriend={isAddingFriend}
              setIsAddingFriend={setIsAddingFriend}
              friendIdInput={friendIdInput}
              setFriendIdInput={setFriendIdInput}
              handleAddFriend={handleAddFriend}
              onLock={handleLock}
            />
          </div>
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center">
            <button className="md:hidden mr-3 p-2 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-3">
              {activeSession ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/50">
                    <span className="font-bold text-emerald-500">{activeSession.partner.username.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-none">{activeSession.partner.username}</h3>
                    <span className="text-xs text-emerald-500 flex items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                      Encrypted • Online
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 font-mono">Select a secure channel</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex border-red-900/50 text-red-500 hover:bg-red-950 hover:border-red-500"
              onClick={() => executeNuke('PANIC')}
            >
              <Activity size={16} className="mr-2" />
              PANIC
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-500"
              onClick={handleLock}
            >
              <Lock size={16} />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
           {!activeSession && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <Shield size={64} className="mb-4 opacity-20" />
                <p>Select a contact to begin secure transmission.</p>
              </div>
           )}
           
           {activeSession && activeSession.messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
               <Lock size={64} className="mb-4" />
               <p>End-to-end encryption verified.</p>
             </div>
           )}

           {activeSession?.messages.map((msg) => (
             <MessageBubble 
               key={msg.id} 
               message={msg} 
               isOwn={msg.senderId === currentUser?.id} 
             />
           ))}
           {isTyping && activeSession && (
             <div className="flex justify-start mb-4 animate-pulse">
               <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-400 font-mono">
                 Decrypting incoming stream...
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 backdrop-blur-sm">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center space-x-3 max-w-4xl mx-auto"
          >
            <div className="relative flex-1 group">
               <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
               <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={activeSession ? "Type a secure message..." : "Select a chat first..."}
                disabled={!activeSession}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={!inputValue.trim() || !activeSession}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(5,150,105,0.4)]"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// Sidebar Component
const SidebarContent = ({ 
  currentUser, 
  sessions,
  activeSessionId,
  onSelectSession,
  onNuke, 
  isMobile,
  closeMobile,
  isAddingFriend,
  setIsAddingFriend,
  friendIdInput,
  setFriendIdInput,
  handleAddFriend,
  onLock
}: { 
  currentUser: User | null; 
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNuke: (type: NukeType) => void;
  isMobile?: boolean;
  closeMobile?: () => void;
  isAddingFriend: boolean;
  setIsAddingFriend: (v: boolean) => void;
  friendIdInput: string;
  setFriendIdInput: (v: string) => void;
  handleAddFriend: (e: React.FormEvent) => void;
  onLock: () => void;
}) => (
  <div className="flex flex-col h-full p-4">
    {isMobile && (
      <div className="flex justify-end mb-4">
        <button onClick={closeMobile} className="text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
    )}

    {/* Profile Card */}
    <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-white border-2 border-slate-600">
           {currentUser?.username.charAt(0)}
        </div>
        <div className="overflow-hidden flex-1">
          <h4 className="font-bold text-white truncate">{currentUser?.username}</h4>
          <p className="text-xs text-emerald-500 font-mono">ID: {currentUser?.id.slice(0, 8)}</p>
        </div>
      </div>
      <div className="flex items-center text-[10px] text-slate-500 font-mono bg-slate-950 p-2 rounded border border-slate-800 cursor-help" title="Your Public Key Fingerprint">
        <Fingerprint size={12} className="mr-2 text-slate-400" />
        <span className="truncate">{currentUser?.publicKey.slice(0, 20)}...</span>
      </div>
    </div>

    {/* Contacts / Chats List */}
    <div className="flex-1 flex flex-col min-h-0 mb-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <Users size={12} className="mr-2" /> Contacts
        </h5>
        <button 
          onClick={() => setIsAddingFriend(!isAddingFriend)}
          className="text-emerald-500 hover:text-emerald-400 transition-colors p-1"
        >
          {isAddingFriend ? <X size={16} /> : <UserPlus size={16} />}
        </button>
      </div>

      {isAddingFriend && (
        <form onSubmit={handleAddFriend} className="mb-4 px-2 animate-[fadeIn_0.2s]">
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-700 focus-within:border-emerald-500 transition-colors">
            <Search size={14} className="ml-2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Enter Ghost ID..." 
              className="w-full bg-transparent border-none text-xs p-2 text-white focus:ring-0 placeholder:text-slate-600"
              value={friendIdInput}
              onChange={(e) => setFriendIdInput(e.target.value)}
              autoFocus
            />
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left p-3 rounded-lg transition-all border ${
              activeSessionId === session.id 
              ? 'bg-slate-800 border-emerald-500/30 shadow-lg' 
              : 'hover:bg-slate-800/50 border-transparent text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-medium text-sm truncate ${activeSessionId === session.id ? 'text-white' : ''}`}>
                {session.partner.username}
              </span>
              {activeSessionId === session.id && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
            </div>
            <div className="text-[10px] truncate mt-1 opacity-60 font-mono">
              {session.messages.length > 0 
                ? session.messages[session.messages.length - 1].text.substring(0, 30) + '...'
                : 'No messages'
              }
            </div>
          </button>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-xs">No active secure channels.</div>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div>
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Security</h5>
        <div className="grid grid-cols-2 gap-2">
           <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-center border-slate-800 hover:bg-slate-800 text-slate-400"
            onClick={() => onNuke('SERVER')}
            title="Clear Chat Logs"
           >
             <RefreshCw size={14} className="mr-1" /> Wipe Logs
           </Button>
           <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-center border-red-900/30 text-red-400 hover:bg-red-950/50 hover:border-red-800"
            onClick={() => onNuke('PANIC')}
            title="New Identity (Keep Friends)"
           >
             <Zap size={14} className="mr-1" /> Swap ID
           </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 gap-2">
         <Button 
          variant="ghost" 
          className="w-full justify-center text-slate-500 hover:text-white"
          onClick={onLock}
         >
           <Lock size={16} className="mr-2" /> Lock Vault
         </Button>
         <Button 
          variant="danger" 
          className="w-full justify-center font-bold tracking-widest"
          onClick={() => onNuke('LOCAL')}
          icon={<Trash2 size={18} />}
         >
           NUKE ACCOUNT
         </Button>
       </div>
    </div>
  </div>
);

export default App;