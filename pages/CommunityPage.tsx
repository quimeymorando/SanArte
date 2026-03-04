import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { communityService } from '../services/dataService';
import { logger } from '../utils/logger';

interface Comment {
  id: string;
  authorName?: string;
  text: string;
  timestamp: Date;
  userId?: string; // Added for ownership check
}

interface Intention {
  id: string;
  text: string;
  authorName?: string; // If undefined, it's anonymous
  candles: number;
  loves: number;
  isUser: boolean;
  theme: 'healing' | 'gratitude' | 'release' | 'feedback';
  timestamp: Date;
  comments: Comment[];
  user_id?: string;
}

export const CommunityPage: React.FC = () => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [newIntention, setNewIntention] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'healing' | 'gratitude' | 'release' | 'feedback'>('gratitude');
  const [activeTab, setActiveTab] = useState<'all' | 'healing' | 'gratitude' | 'feedback'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New Features State
  const [showName, setShowName] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const [user, setUser] = useState<import('../types').UserProfile | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const u = await authService.getUser();
        setUser(u);

        const data = await communityService.getIntentions();
        // Map service data to local interface if needed, although they look very similar now.
        // dataService returns objects compatible with our Intention interface mostly.
        // We might need to ensure comments structure matches.
        const mappedData: Intention[] = data.map(item => ({
          ...item,
          // Re-calculate ownership in client to be safe
          isUser: item.user_id === u?.id,
          comments: item.comments?.map((c: any) => ({
            id: c.id,
            text: c.text,
            authorName: c.author_name,
            userId: c.user_id, // Map user_id to local property
            timestamp: new Date(c.created_at || Date.now())
          })) || []
        }));

        // Sort by newest first
        mappedData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setIntentions(mappedData);
      } catch (error) {
        logger.error("Error loading community data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePost = async () => {
    if (!newIntention.trim()) return;

    // Optimistic Update
    const tempId = Date.now().toString();
    const newPostOptimistic: Intention = {
      id: tempId,
      text: newIntention,
      authorName: showName ? user?.name : undefined,
      candles: 0,
      loves: 0,
      isUser: true,
      theme: selectedTheme,
      timestamp: new Date(),
      comments: []
    };

    setIntentions([newPostOptimistic, ...intentions]);
    setNewIntention('');

    try {
      await communityService.createIntention(
        newIntention,
        selectedTheme,
        showName ? (user?.name || 'Usuario') : 'Anónimo'
      );
      // Refresh in background to get real ID
      const freshData = await communityService.getIntentions();
      // Remap again
      const mappedData: Intention[] = freshData.map(item => ({
        ...item,
        comments: item.comments?.map((c: any) => ({
          id: c.id,
          text: c.text,
          authorName: c.author_name,
          timestamp: new Date(c.created_at || Date.now())
        })) || []
      }));
      setIntentions(mappedData);

    } catch (err) {
      logger.error("Error posting intention:", err);
      // Revert on error could be implemented here
      alert("Hubo un error al publicar tu mensaje. Inténtalo de nuevo.");
      setIntentions(intentions.filter(i => i.id !== tempId));
    }
  };

  const handleDeleteComment = async (intentionId: string, commentId: string) => {
    if (!window.confirm("¿Borrar tu comentario?")) return;

    // Optimistic Delete
    const updatedIntentions = [...intentions];
    const postIndex = updatedIntentions.findIndex(p => p.id === intentionId);
    if (postIndex !== -1) {
      updatedIntentions[postIndex] = {
        ...updatedIntentions[postIndex],
        comments: updatedIntentions[postIndex].comments.filter(c => c.id !== commentId)
      };
      setIntentions(updatedIntentions);
    }

    try {
      await communityService.deleteComment(commentId);
    } catch (err) {
      logger.error("Error deleting", err);
      alert("No se pudo eliminar.");
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;

    // Find post to update
    const postIndex = intentions.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    // Optimistic comment
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      authorName: showName ? user?.name : undefined,
      userId: user?.id,
      timestamp: new Date()
    };

    const updatedIntentions = [...intentions];
    updatedIntentions[postIndex] = {
      ...updatedIntentions[postIndex],
      comments: [...updatedIntentions[postIndex].comments, comment]
    };
    setIntentions(updatedIntentions);
    setNewComment('');

    try {
      await communityService.addComment(
        postId,
        newComment,
        showName ? (user?.name || 'Usuario') : 'Anónimo'
      );
      // We could refresh here too, but comments are less critical to have real IDs immediately unless editing/deleting
    } catch (err) {
      logger.error("Error posting comment", err);
      alert("Error al guardar el comentario.");
    }
  };

  const lightCandle = async (id: string) => {
    // Optimistic update
    setIntentions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, candles: item.candles + 1 };
      }
      return item;
    }));

    try {
      await communityService.lightCandle(id);
    } catch (err) {
      logger.error(err);
    }
  };

  const sendLove = async (id: string) => {
    // Optimistic update
    setIntentions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, loves: item.loves + 1 };
      }
      return item;
    }));

    try {
      await communityService.sendLove(id);
    } catch (err) {
      logger.error(err);
    }
  };

  const toggleComments = (id: string) => {
    if (activeCommentId === id) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(id);
    }
  };

  const filteredIntentions = activeTab === 'all'
    ? intentions
    : intentions.filter(i => i.theme === activeTab);

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'healing': return 'healing';
      case 'gratitude': return 'spa';
      case 'release': return 'air';
      case 'feedback': return 'reviews';
      default: return 'favorite';
    }
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'healing': return 'Sanación';
      case 'gratitude': return 'Gratitud';
      case 'release': return 'Soltar';
      case 'feedback': return 'Testimonio';
      default: return 'Mensaje';
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen pb-24 pt-32 bg-gradient-to-b from-indigo-50/50 to-white dark:from-[#1a2c32] dark:to-[#101e22]">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(34,211,238,0.2)] mb-6 animate-pulse">
            ✨
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">Tribu SanArte</h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed font-medium">
            Un espacio sagrado para agradecer, soltar y acompañarnos en el proceso de evolucionar. Tu luz también sana a otros.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">
        {/* Input Box */}
        <div className="bg-[#0a1114]/80 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/10 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
          <label className="block text-base font-black text-white mb-5 flex items-center gap-2 relative z-10">
            <span className="text-xl">✍️</span> Comparte tu luz con la tribu:
          </label>

          {/* Theme Selector */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['gratitude', 'healing', 'release', 'feedback'].map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[1rem] text-xs font-black transition-all border relative z-10 ${selectedTheme === theme
                  ? 'bg-primary/10 text-primary border-primary/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white/80'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">{getThemeIcon(theme)}</span>
                {getThemeLabel(theme)}
              </button>
            ))}
          </div>

          <textarea
            value={newIntention}
            onChange={(e) => setNewIntention(e.target.value)}
            className="w-full relative z-10 bg-black/40 border border-white/5 rounded-[1.5rem] p-5 text-white placeholder-white/20 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none text-base mt-2"
            rows={4}
            placeholder={
              selectedTheme === 'feedback' ? "Cuéntanos, ¿cómo te ha ayudado SanArte hoy?" :
                selectedTheme === 'gratitude' ? "Hoy agradezco profundamente por..." :
                  "Escribe tu intención médica o mensaje aquí..."
            }
          />
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">

            {/* Identity Toggle - Improved UI */}
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Autor:</span>
              <button
                onClick={() => setShowName(!showName)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[1rem] text-xs font-black transition-all border ${showName
                  ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                  }`}
              >
                {showName ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span className="uppercase tracking-wide">{user?.name || 'Mí'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                    <span className="uppercase tracking-wide">Anónimo</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handlePost}
              disabled={!newIntention.trim()}
              className="relative z-10 w-full sm:w-auto overflow-hidden group bg-gradient-to-r from-primary to-cyan-400 text-white px-8 py-3 rounded-[1.2rem] font-black tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10">Publicar Luz</span>
              <span className="material-symbols-outlined text-sm relative z-10 group-hover:translate-x-1 transition-transform">send</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-10">
          <button onClick={() => setActiveTab('all')} className={`px-5 py-2 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all border ${activeTab === 'all' ? 'bg-white text-gray-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20'}`}>Todos</button>
          <button onClick={() => setActiveTab('healing')} className={`px-5 py-2 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all border ${activeTab === 'healing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20'}`}>Sanación</button>
          <button onClick={() => setActiveTab('gratitude')} className={`px-5 py-2 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all border ${activeTab === 'gratitude' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20'}`}>Gratitud</button>
          <button onClick={() => setActiveTab('feedback')} className={`px-5 py-2 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all border ${activeTab === 'feedback' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20'}`}>Testimonios</button>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-4">
          {filteredIntentions.map((item) => (
            <div key={item.id} className="bg-[#0a1114]/80 backdrop-blur-xl p-7 rounded-[2.5rem] shadow-xl border border-white/5 hover:border-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-[1.2rem] flex items-center justify-center border ${item.theme === 'healing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    item.theme === 'gratitude' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                      item.theme === 'feedback' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-white/5 text-white/50 border-white/10'
                    }`}>
                    <span className="material-symbols-outlined text-2xl font-black">
                      {getThemeIcon(item.theme)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-base font-black ${item.authorName ? 'text-white' : 'text-white/50'}`}>
                      {item.authorName || 'Alma Anónima'}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
                      {getThemeLabel(item.theme)}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                  {item.timestamp.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} • {item.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed mb-8 relative z-10">
                "{item.text}"
              </p>

              <div className="flex items-center gap-6 pt-5 border-t border-white/5 relative z-10">
                {/* Candle Button */}
                <button
                  onClick={() => lightCandle(item.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors group"
                >
                  <span className={`material-symbols-outlined text-2xl group-hover:animate-pulse ${item.candles > 0 ? 'text-orange-400 filled' : ''}`}>light_mode</span>
                  <span className={`text-xs font-bold ${item.candles > 0 ? 'text-orange-400' : ''}`}>{item.candles || 'Encender'}</span>
                </button>

                {/* Heart Button */}
                <button
                  onClick={() => sendLove(item.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group"
                >
                  <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${item.loves > 0 ? 'text-red-500 filled' : ''}`}>favorite</span>
                  <span className={`text-xs font-bold ${item.loves > 0 ? 'text-red-500' : ''}`}>{item.loves || 'Amar'}</span>
                </button>

                {/* Delete Intention Button - Footer */}
                {/* Delete Intention Button - Footer */}
                {/* Admin or Owner check */}
                {((user?.role === 'admin') || item.isUser || (user && item.user_id === user?.id)) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('¿Eliminar esta publicación?')) {
                        communityService.deleteIntention(item.id).then(() => {
                          setIntentions(prev => prev.filter(i => i.id !== item.id));
                        }).catch(() => alert('Error al eliminar'));
                      }
                    }}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group ml-auto sm:ml-0"
                    title="Eliminar publicación"
                  >
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform text-red-400/70 group-hover:text-red-500">delete</span>
                    <span className="text-xs font-bold hidden sm:inline text-red-400/70 group-hover:text-red-500">Eliminar</span>
                  </button>
                )}

                {/* Comment Toggle */}
                <button
                  onClick={() => toggleComments(item.id)}
                  className={`flex items-center gap-2 transition-colors ml-auto ${activeCommentId === item.id || item.comments.length > 0 ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                  <span className="text-xs font-bold">{item.comments.length || 'Comentar'}</span>
                </button>
              </div>

              {/* Comments Section */}
              {activeCommentId === item.id && (
                <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2 relative z-10">
                  {/* Existing Comments */}
                  {item.comments.length > 0 && (
                    <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {item.comments.map(comment => (
                        <div key={comment.id} className="bg-black/20 p-4 rounded-[1.2rem] text-sm border border-white/5 relative overflow-hidden group/comment">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-[20px] rounded-full pointer-events-none group-hover/comment:bg-primary/10 transition-colors duration-500"></div>
                          <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className={`text-xs font-black uppercase tracking-wider ${comment.authorName ? 'text-primary' : 'text-white/40'}`}>
                              {comment.authorName || 'Alma Anónima'}
                            </span>
                            {/* Delete Button (Only for owner or admin) */}
                            {user && (user.role === 'admin' || comment.userId === user.id || item.isUser) && (
                              <button onClick={() => handleDeleteComment(item.id, comment.id)} className="text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all p-1.5 rounded-lg" title={user.role === 'admin' ? "Eliminar (Admin)" : "Eliminar"}>
                                <span className={`material-symbols-outlined text-[16px] font-bold ${user.role === 'admin' ? 'text-red-300' : ''}`}>close</span>
                              </button>
                            )}
                          </div>
                          <p className="text-white/80 leading-relaxed relative z-10">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Comment Input */}
                  <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-[1.2rem] p-1 pr-2 relative z-10 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(item.id)}
                      placeholder="Escribe un mensaje de apoyo..."
                      className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-white placeholder-white/30 focus:ring-0"
                    />
                    <button
                      onClick={() => handleComment(item.id)}
                      disabled={!newComment.trim()}
                      className="size-10 bg-gradient-to-br from-primary to-cyan-400 text-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <p className="text-[9px] text-gray-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">{showName ? 'visibility' : 'visibility_off'}</span>
                      Comentando como {showName ? user?.name : 'Anónimo'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredIntentions.length === 0 && (
            <div className="text-center py-20 px-6 animate-in fade-in zoom-in duration-700 bg-[#0a1114]/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
              <div className="size-24 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                <span className="material-symbols-outlined text-4xl text-primary animate-pulse">auto_awesome</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Sé la primera chispa</h3>
              <p className="text-white/50 max-w-sm mx-auto leading-relaxed font-medium">
                Este espacio está esperando tu luz. Comparte tu intención, sanación o gratitud y comienza el movimiento.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-10 text-gray-400 text-sm italic">
          "Tu crítica constructiva nos ayuda a crecer. Gracias por ser parte."
        </div>
      </div>
    </div>
  );
};