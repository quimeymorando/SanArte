import React, { Suspense, lazy, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { authService } from './services/authService';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import { useRoutineNotifications } from './hooks/useRoutineNotifications';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationManager } from './components/NotificationManager';

import { ThemeProvider } from './context/ThemeContext';

import { XPToast } from './components/XPToast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorProvider } from './context/GlobalErrorContext';
import { ConfettiManager } from './components/ConfettiManager';


import { Analytics } from "@vercel/analytics/react"

// All pages lazy-loaded for optimal code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const BentoGrid = lazy(() => import('./features/dashboard/BentoGrid').then(m => ({ default: m.BentoGrid })));
const SearchPage = lazy(() => import('./pages/HomePages').then(m => ({ default: m.SearchPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const SymptomDetailPage = lazy(() => import('./pages/DetailPages').then(m => ({ default: m.SymptomDetailPage })));
const FavoritesPage = lazy(() => import('./pages/UserPages').then(m => ({ default: m.FavoritesPage })));
const RoutinesPage = lazy(() => import('./pages/UserPages').then(m => ({ default: m.RoutinesPage })));
const ProfilePage = lazy(() => import('./pages/UserPages').then(m => ({ default: m.ProfilePage })));
const JournalPage = lazy(() => import('./pages/JournalPage').then(m => ({ default: m.JournalPage })));
const UpgradePage = lazy(() => import('./pages/UpgradePage'));
const SharedResultPage = lazy(() => import('./pages/SharedResultPage').then(m => ({ default: m.SharedResultPage })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App: React.FC = () => {
  // Initialize notification checker
  useRoutineNotifications();
  // Check for auth redirects
  useEffect(() => {
    authService.getUser().catch(() => null);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        authService.clearCachedUser();
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        authService.clearCachedUser();
        authService.getUser().catch(() => null);
      }

      // If user just signed in (e.g. from email link), redirect to home if on landing
      if (event === 'SIGNED_IN' && session) {
        const currentPath = window.location.pathname;
        const isLanding = currentPath === '/' || currentPath === '/login' || currentPath === '';
        const isPublic = currentPath.includes('/share/') ||
          currentPath.includes('/privacy') ||
          currentPath.includes('/terms');

        if (isLanding && !isPublic) {
          window.location.replace('/home');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <GlobalErrorProvider>
        <ErrorBoundary>
          <ConfettiManager />
          <XPToast />
          <Analytics />
          <BrowserRouter>
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 transition-colors duration-200 font-sans">
              <NotificationManager />
              <Suspense fallback={
                <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                  <div className="relative size-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-purple-400 border-l-transparent animate-spin"></div>
                    <div className="absolute inset-3 rounded-full bg-white dark:bg-surface-dark shadow-inner flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary animate-pulse">spa</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-400 animate-pulse">Cargando...</p>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />

                  {/* Protected Routes - User must be logged in */}
                  <Route path="/home" element={<ProtectedRoute><BentoGrid /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                  <Route path="/symptom-detail" element={<ProtectedRoute><SymptomDetailPage /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

                  <Route path="/routines" element={<ProtectedRoute><RoutinesPage /></ProtectedRoute>} />
                  <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />

                  {/* Public Pages */}
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/share/:id" element={<SharedResultPage />} />

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
              <Navigation />
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </GlobalErrorProvider>
    </ThemeProvider>
  );
};

export default App;
