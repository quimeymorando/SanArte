import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { communityService, type IntentionData } from '../services/dataService';
import {
  emptyReactionCounts,
  emptyUserReactions,
  type ReactionCounts,
  type UserReactions,
} from '../services/communityReactions';
import { logger } from '../utils/logger';

import { ComposeModal } from '../components/community/ComposeModal';
import { IntentionCard, type CardIntention } from '../components/community/IntentionCard';
import { IntentionDetailModal, type DetailIntention } from '../components/community/IntentionDetailModal';
import { EmptyState } from '../components/community/EmptyState';
import { SkeletonCard } from '../components/community/SkeletonCard';
import { ThreadComment } from '../components/community/CommentThread';
import { GOLD, GOLD_GRAD, NAVY, THEMES, type ThemeKey } from '../components/community/types';

type Order = 'recent' | 'accompanied';
type FeedItem = IntentionData & { commentsTyped: ThreadComment[] };

const ORDER_TABS: { key: Order; label: string }[] = [
  { key: 'recent', label: 'Recientes' },
  { key: 'accompanied', label: 'Acompañadas' },
];

const FILTER_TABS: { key: ThemeKey | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  ...THEMES.map((t) => ({ key: t.key, label: t.label })),
];

const totalReactions = (c: ReactionCounts) => c.love + c.hug + c.accompany + c.reverence;

const mapToFeedItem = (item: IntentionData): FeedItem => ({
  ...item,
  commentsTyped: (item.comments || []).map((c: any) => ({
    id: c.id,
    text: c.text,
    authorName: c.author_name,
    userId: c.user_id,
    timestamp: new Date(c.created_at || Date.now()),
  })),
});

export const CommunityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTheme = searchParams.get('theme') as ThemeKey | null;

  const [intentions, setIntentions] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<import('../types').UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ThemeKey | 'all'>(
    initialTheme && THEMES.some((t) => t.key === initialTheme) ? initialTheme : 'all'
  );
  const [order, setOrder] = useState<Order>('recent');

  const [composeOpen, setComposeOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const fetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Initial load
  useEffect(() => {
    if (fetchedRef.current) return;
    if (isFetchingRef.current) return;

    let cancelled = false;
    isFetchingRef.current = true;
    fetchedRef.current = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const u = await authService.getUser();
        if (cancelled) return;
        setUser(u);

        const data = await communityService.getIntentions();
        if (cancelled) return;
        setIntentions(data.map(mapToFeedItem));
      } catch (err) {
        if (!cancelled) logger.error('Community load error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
        isFetchingRef.current = false;
      }
    };
    load();

    return () => { cancelled = true; };
  }, []);

  const reload = async () => {
    try {
      const fresh = await communityService.getIntentions();
      setIntentions(fresh.map(mapToFeedItem));
    } catch (err) {
      logger.error(err);
    }
  };

  // ─── Filtros + orden ─────────────────────────────────
  const filtered = useMemo(() => {
    const base = activeTab === 'all' ? intentions : intentions.filter((i) => i.theme === activeTab);
    const sorted = [...base];
    if (order === 'recent') {
      sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else {
      sorted.sort((a, b) => totalReactions(b.reactionCounts) - totalReactions(a.reactionCounts));
    }
    return sorted;
  }, [intentions, activeTab, order]);

  // ─── Handlers ────────────────────────────────────────
  const handleReactionChange = (id: string, next: { counts: ReactionCounts; active: UserReactions }) => {
    setIntentions((prev) =>
      prev.map((p) => p.id === id ? { ...p, reactionCounts: next.counts, userReactions: next.active } : p)
    );
  };

  const handlePost = async ({ text, theme, anonymous }: { text: string; theme: ThemeKey; anonymous: boolean }) => {
    const tempId = `tmp-${Date.now()}`;
    const optimistic: FeedItem = {
      id: tempId, text,
      authorName: anonymous ? 'Anónimo' : (user?.name || 'Usuario'),
      candles: 0, loves: 0,
      isUser: true, theme, timestamp: new Date(),
      comments: [], commentsTyped: [],
      reactionCounts: emptyReactionCounts(),
      userReactions: emptyUserReactions(),
    };
    setIntentions((prev) => [optimistic, ...prev]);
    setComposeOpen(false);
    try {
      await communityService.createIntention(text, theme, anonymous ? 'Anónimo' : (user?.name || 'Usuario'));
      await reload();
    } catch (err) {
      logger.error(err);
      alert('No pudimos publicar. Probá de nuevo.');
      setIntentions((prev) => prev.filter((p) => p.id !== tempId));
    }
  };

  const handleAddComment = async (intentionId: string, text: string) => {
    const tempId = `tmp-c-${Date.now()}`;
    const optimistic: ThreadComment = {
      id: tempId, text,
      authorName: user?.name || 'Anónimo',
      userId: user?.id, timestamp: new Date(),
    };
    setIntentions((prev) => prev.map((p) =>
      p.id === intentionId ? { ...p, commentsTyped: [...p.commentsTyped, optimistic] } : p
    ));
    try {
      await communityService.addComment(intentionId, text, user?.name || 'Anónimo');
    } catch (err) {
      logger.error(err);
      setIntentions((prev) => prev.map((p) =>
        p.id === intentionId ? { ...p, commentsTyped: p.commentsTyped.filter((c) => c.id !== tempId) } : p
      ));
    }
  };

  const handleDeleteComment = async (intentionId: string, commentId: string) => {
    if (!window.confirm('¿Borrar comentario?')) return;
    const snapshot = intentions;
    setIntentions((prev) => prev.map((p) =>
      p.id === intentionId ? { ...p, commentsTyped: p.commentsTyped.filter((c) => c.id !== commentId) } : p
    ));
    try {
      await communityService.deleteComment(commentId);
    } catch (err) {
      logger.error(err);
      setIntentions(snapshot);
    }
  };

  const handleDeleteIntention = async (intentionId: string) => {
    const snapshot = intentions;
    setIntentions((prev) => prev.filter((p) => p.id !== intentionId));
    try {
      await communityService.deleteIntention(intentionId);
    } catch (err) {
      logger.error(err);
      alert('Error al borrar.');
      setIntentions(snapshot);
    }
  };

  const detailIntention: DetailIntention | null = useMemo(() => {
    if (!detailId) return null;
    const it = intentions.find((i) => i.id === detailId);
    if (!it) return null;
    return {
      id: it.id, text: it.text, authorName: it.authorName, theme: it.theme as ThemeKey,
      timestamp: it.timestamp,
      reactionCounts: it.reactionCounts, userReactions: it.userReactions,
      comments: it.commentsTyped,
      isUser: it.isUser, user_id: it.user_id,
    };
  }, [detailId, intentions]);

  return (
    <div style={{ background: NAVY, minHeight: '100dvh', paddingBottom: 100 }}>
      {/* Header sticky */}
      <div style={{
        padding: '64px 20px 20px',
        background: 'linear-gradient(to bottom, rgba(6,13,27,1) 0%, transparent 100%)',
        position: 'sticky', top: 0, zIndex: 10,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <p style={{
          fontFamily: 'Outfit', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: GOLD, margin: '0 0 6px',
        }}>Sanando en comunidad</p>
        <h1 style={{
          fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 300,
          color: '#F0EBE0', margin: '0 0 6px',
        }}>Comunidad</h1>
        <p style={{ fontFamily: 'Outfit', fontSize: 12, color: '#4A4840', margin: '0 0 16px' }}>
          Un espacio para compartir tu camino
        </p>

        {/* Order selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {ORDER_TABS.map((o) => (
            <button
              key={o.key}
              onClick={() => setOrder(o.key)}
              style={{
                padding: '6px 12px', borderRadius: 999,
                border: order === o.key ? `1px solid ${GOLD}66` : '1px solid rgba(255,255,255,0.08)',
                background: order === o.key ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: order === o.key ? GOLD : '#5A6170',
                fontFamily: 'Outfit', fontSize: 11, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{o.label}</button>
          ))}
        </div>

        {/* Theme tabs — 2 filas en mobile, 1 fila en >= 520px */}
        <style>{`
          .sa-theme-tabs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
          }
          @media (min-width: 520px) {
            .sa-theme-tabs { display: flex; }
            .sa-theme-tabs > button { flex: 1 0 auto; }
          }
        `}</style>
        <div className="sa-theme-tabs" style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: 4,
        }}>
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: 'none',
                cursor: 'pointer',
                background: activeTab === t.key ? 'rgba(201,168,76,0.12)' : 'transparent',
                fontFamily: 'Outfit', fontSize: 12, fontWeight: 500,
                color: activeTab === t.key ? GOLD : '#5A6170',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 0' }}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState onCompose={() => setComposeOpen(true)} />
        ) : (
          filtered.map((item, idx) => {
            const card: CardIntention = {
              id: item.id, text: item.text, authorName: item.authorName,
              theme: item.theme as ThemeKey, timestamp: item.timestamp,
              commentsCount: item.commentsTyped.length,
              reactionCounts: item.reactionCounts, userReactions: item.userReactions,
            };
            return (
              <IntentionCard
                key={item.id}
                intention={card}
                index={idx}
                onOpen={(id) => setDetailId(id)}
                onReactionChange={handleReactionChange}
              />
            );
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setComposeOpen(true)}
        aria-label="Compartir"
        style={{
          position: 'fixed', bottom: 90, right: 20,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 24px', background: GOLD_GRAD, color: NAVY,
          border: 'none', borderRadius: 999, cursor: 'pointer',
          zIndex: 50, boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
          fontFamily: 'Outfit', fontSize: 13, fontWeight: 600,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'wght' 400", lineHeight: 1 }}>edit</span>
        Compartir
      </button>

      {/* Modals */}
      <ComposeModal
        open={composeOpen}
        defaultAuthorName={user?.name}
        onClose={() => setComposeOpen(false)}
        onSubmit={handlePost}
      />

      <IntentionDetailModal
        intention={detailIntention}
        currentUserId={user?.id}
        isAdmin={user?.role === 'admin'}
        onClose={() => setDetailId(null)}
        onReactionChange={handleReactionChange}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onDeleteIntention={handleDeleteIntention}
      />
    </div>
  );
};
