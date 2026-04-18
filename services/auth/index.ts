import { authCore, injectAuthCoreDeps } from './authCore';
import { profileOps, invalidateUserCache, dailySyncByUser } from './profileService';
import { gamificationOps, injectGamificationDeps } from './gamificationService';

// Wire up cross-module dependencies to avoid circular imports
injectAuthCoreDeps({
  getUser: () => profileOps.getUser(),
  invalidateUserCache,
  clearDailySync: () => dailySyncByUser.clear(),
});

injectGamificationDeps({
  getUser: () => profileOps.getUser(),
});

export const authService = {
  ...profileOps,
  ...authCore,
  ...gamificationOps,
};
