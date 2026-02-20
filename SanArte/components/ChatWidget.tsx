import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendMessageToChat } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';
import { authService } from '../services/authService';
import UpgradeModal from './UpgradeModal';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'model', text: 'Hola 👋 Soy SanArte AI. ¿Cómo te sientes hoy?', timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await authService.getUser();
      setUser(u);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const canSend = await authService.incrementMessageCount();
    if (!canSend) {
      setShowUpgrade(true);
      return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));
      const responseText = await sendMessageToChat(history, userMsg.text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() }]);
      const updatedUser = await authService.getUser();
      setUser(updatedUser);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: 'error', role: 'model', text: 'Siento una interferencia en mi conexión. Intentémoslo de nuevo.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (location.pathname === '/') return null;

  return (
    <>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onSuccess={async () => { const u = await authService.getUser(); setUser(u); }} />}

      <div className={`fixed bottom-24 right-4 z-[100] transition-all duration-500 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'} md:bottom-8 md:right-8`}>
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-[0_20px_50px_rgba(13,185,242,0.2)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <span className="material-symbols-outlined">psychology_alt</span>
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">SanArte AI</h3>
                {!user?.isPremium && (
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-tighter">
                    {5 - (user?.dailyMessageCount || 0)} mensajes hoy
                  </p>
                )}
              </div>
            </div>
            <button aria-label="Cerrar chat" onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-50 dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pregunta a tu conciencia..."
                className="flex-1 h-12 pl-6 pr-12 rounded-2xl bg-white dark:bg-gray-900 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
              />
              <button
                aria-label="Enviar mensaje"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-4 z-[100] size-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 md:bottom-8 md:right-8 ${isOpen ? 'bg-gray-900 rotate-90' : 'bg-primary'}`}
      >
        <span className="material-symbols-outlined text-3xl">{isOpen ? 'close' : 'chat_bubble'}</span>
        {!user?.isPremium && !isOpen && (
          <div className="absolute -top-1 -right-1 size-6 bg-rose-500 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce">
            {5 - (user?.dailyMessageCount || 0)}
          </div>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
