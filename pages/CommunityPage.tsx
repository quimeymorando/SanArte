import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { communityService } from '../services/dataService';
import { logger } from '../utils/logger';

interface Comment {
  id: string;
  authorName?: string;
  text: string;
  timestamp: Date;
  userId?: string;
}

interface Intention {
  id: string;
  text: string;
  authorName?: string;
  candles: number;
  loves: number;
  isUser: boolean;
  theme: 'healing' | 'gratitude' | 'release' | 'feedback';
  timestamp: Date;
  comments: Comment[];
  user_id?: string;
}

const THEMES = [
  { key: 'gratitude', label: 'Gratitud', icon: 'spa' },
  { key: 'healing', label: 'Sanación', icon: 'healing' },
  { key: 'release', label: 'Soltar', icon: 'air' },
  { key: 'feedback', label: 'Testimonio', icon: 'reviews' },
] as const;

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'healing', label: 'Sanación' },
  { key: 'gratitude', label: 'Gratitud' },
  { key: 'feedback', label: 'Testimonios' },
] as const;

export const CommunityPage: React.FC = () => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [newIntention, setNewIntention] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Intention['theme']>('gratitude');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
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
        const mapped: Intention[] = data.map(item => ({
          ...item,
          isUser: item.user_id === u?.id,
          comments: item.comments?.map((c: any) => ({
            id: c.id, text: c.text, authorName: c.author_name,
            userId: c.user_id, timestamp: new Date(c.created_at || Date.now()),
          })) || [],
        }));
        mapped.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setIntentions(mapped);
      } catch (error) { logger.error("Community load error:", error); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const handlePost = async () => {
    if (!newIntention.trim()) return;
    const tempId = Date.now().toString();
    const optimistic: Intention = {
      id: tempId, text: newIntention, authorName: showName ? user?.name : undefined,
      candles: 0, loves: 0, isUser: true, theme: selectedTheme,
      timestamp: new Date(), comments: [],
    };
    setIntentions([optimistic, ...intentions]);
    setNewIntention('');
    try {
      await communityService.createIntention(newIntention, selectedTheme, showName ? (user?.name || 'Usuario') : 'Anónimo');
      const fresh = await communityService.getIntentions();
      setIntentions(fresh.map(item => ({
        ...item,
        comments: item.comments?.map((c: any) => ({
          id: c.id, text: c.text, authorName: c.author_name, timestamp: new Date(c.created_at || Date.now()),
        })) || [],
      })));
    } catch (err) {
      logger.error(err);
      alert("Error al publicar.");
      setIntentions(intentions.filter(i => i.id !== tempId));
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;
    const comment: Comment = { id: Date.now().toString(), text: newComment, authorName: showName ? user?.name : undefined, userId: user?.id, timestamp: new Date() };
    setIntentions(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    setNewComment('');
    try { await communityService.addComment(postId, newComment, showName ? (user?.name || 'Usuario') : 'Anónimo'); }
    catch (err) { logger.error(err); }
  };

  const handleDeleteComment = async (intentionId: string, commentId: string) => {
    if (!window.confirm("¿Borrar comentario?")) return;
    setIntentions(prev => prev.map(p => p.id === intentionId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p));
    try { await communityService.deleteComment(commentId); } catch (err) { logger.error(err); }
  };

  const lightCandle = async (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, candles: i.candles + 1 } : i));
    try { await communityService.lightCandle(id); } catch (err) { logger.error(err); }
  };

  const sendLove = async (id: string) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, loves: i.loves + 1 } : i));
    try { await communityService.sendLove(id); } catch (err) { logger.error(err); }
  };

  const filtered = activeTab === 'all' ? intentions : intentions.filter(i => i.theme === activeTab);
  const getThemeIcon = (t: string) => THEMES.find(th => th.key === t)?.icon || 'favorite';
  const getThemeLabel = (t: string) => THEMES.find(th => th.key === t)?.label || 'Mensaje';

  const canDelete = (item: Intention) => user?.role === 'admin' || item.isUser || (user && item.user_id === user.id);

  return (
    <div className="min-h-screen bg-[#080c0f] pb-28 pt-20 px-5">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Comunidad</h1>
          <p className="text-white/25 text-sm mt-0.5">Un espacio para agradecer, soltar y acompañarnos.</p>
        </div>

        {/* Compose */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6">
          {/* Theme pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {THEMES.map(t => (
              <button
                key={t.key}
                onClick={() => setSelectedTheme(t.key as Intention['theme'])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTheme === t.key
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={newIntention}
            onChange={(e) => setNewIntention(e.target.value)}
            rows={3}
            placeholder={
              selectedTheme === 'feedback' ? "¿Cómo te ha ayudado SanArte?" :
              selectedTheme === 'gratitude' ? "Hoy agradezco por..." :
              "Compartí tu intención o mensaje..."
            }
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 focus:border-teal-500/30 outline-none resize-none leading-relaxed transition-colors"
          />

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowName(!showName)}
              className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{showName ? 'visibility' : 'visibility_off'}</span>
              {showName ? user?.name || 'Con nombre' : 'Anónimo'}
            </button>

            <button
              onClick={handlePost}
              disabled={!newIntention.trim()}
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-white/[0.06] disabled:text-white/20 text-black font-semibold text-sm transition-all active:scale-95"
            >
              Publicar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl mb-6 border border-white/[0.06] overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap px-3 ${
                activeTab === t.key ? 'bg-white/[0.08] text-white' : 'text-white/25 hover:text-white/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-white/10 text-3xl animate-pulse">self_improvement</span>
          </div>
        )}

        {/* Feed */}
        {!isLoading && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] transition-all">
                {/* Post header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-lg flex items-center justify-center ${
                      item.theme === 'healing' ? 'bg-blue-500/10 text-blue-400' :
                      item.theme === 'gratitude' ? 'bg-rose-500/10 text-rose-400' :
                      item.theme === 'feedback' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-white/[0.05] text-white/30'
                    }`}>
                      <span className="material-symbols-outlined text-lg">{getThemeIcon(item.theme)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white/70">{item.authorName || 'Anónimo'}</span>
                      <span className="text-[10px] text-white/15 block">
                        {getThemeLabel(item.theme)} • {item.timestamp.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {canDelete(item) && (
                    <button
                      onClick={() => { if (window.confirm('¿Eliminar?')) communityService.deleteIntention(item.id).then(() => setIntentions(prev => prev.filter(i => i.id !== item.id))).catch(() => alert('Error')); }}
                      className="p-1 text-white/0 hover:text-red-400/60 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-white/50 text-sm leading-relaxed mb-4">{item.text}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-white/[0.04]">
                  <button onClick={() => lightCandle(item.id)} className="flex items-center gap-1.5 text-white/20 hover:text-amber-400 transition-colors">
                    <span className={`material-symbols-outlined text-lg ${item.candles > 0 ? 'text-amber-400' : ''}`}>light_mode</span>
                    <span className="text-xs">{item.candles || ''}</span>
                  </button>
                  <button onClick={() => sendLove(item.id)} className="flex items-center gap-1.5 text-white/20 hover:text-rose-400 transition-colors">
                    <span className={`material-symbols-outlined text-lg ${item.loves > 0 ? 'text-rose-400 filled' : ''}`}>favorite</span>
                    <span className="text-xs">{item.loves || ''}</span>
                  </button>
                  <button onClick={() => setActiveCommentId(activeCommentId === item.id ? null : item.id)} className={`flex items-center gap-1.5 ml-auto transition-colors ${activeCommentId === item.id ? 'text-teal-400' : 'text-white/20 hover:text-white/40'}`}>
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    <span className="text-xs">{item.comments.length || ''}</span>
                  </button>
                </div>

                {/* Comments */}
                {activeCommentId === item.id && (
                  <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                    {item.comments.map(c => (
                      <div key={c.id} className="flex items-start gap-3 py-2 group/c">
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-teal-400/50 font-medium">{c.authorName || 'Anónimo'}</span>
                          <p className="text-white/40 text-sm mt-0.5">{c.text}</p>
                        </div>
                        {user && (user.role === 'admin' || c.userId === user.id) && (
                          <button onClick={() => handleDeleteComment(item.id, c.id)} className="p-1 text-white/0 group-hover/c:text-white/15 hover:!text-red-400 transition-all">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(item.id)}
                        placeholder="Escribí un mensaje de apoyo..."
                        className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/15 focus:border-teal-500/30 outline-none transition-colors"
                      />
                      <button
                        onClick={() => handleComment(item.id)}
                        disabled={!newComment.trim()}
                        className="size-9 rounded-lg bg-teal-500 disabled:bg-white/[0.06] text-black disabled:text-white/20 flex items-center justify-center transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="size-14 rounded-full bg-white/[0.03] mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/15 text-2xl">diversity_1</span>
                </div>
                <p className="text-white/25 text-sm">Sé la primera chispa.</p>
                <p className="text-white/15 text-xs mt-1">Compartí tu intención o gratitud.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
