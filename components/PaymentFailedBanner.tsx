import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface PaymentFailedBannerProps {
  user: UserProfile;
}

const PaymentFailedBanner: React.FC<PaymentFailedBannerProps> = React.memo(function PaymentFailedBanner({ user }) {
  const navigate = useNavigate();

  // Only show banner if user has a grace period set and it hasn't expired
  if (!user.premiumGraceUntil) return null;
  const gracePeriodEnd = new Date(user.premiumGraceUntil);
  if (isNaN(gracePeriodEnd.getTime()) || gracePeriodEnd < new Date()) return null;

  const daysLeft = Math.ceil((gracePeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed top-0 left-0 right-0 z-[300] bg-gradient-to-r from-red-600 to-orange-500 text-white py-2.5 px-4 flex items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="material-symbols-outlined text-lg">warning</span>
        <span>
          Hubo un problema con tu pago. Tu acceso premium expira en{' '}
          <strong>{daysLeft} {daysLeft === 1 ? 'día' : 'días'}</strong>.
        </span>
      </div>
      <button
        onClick={() => navigate('/upgrade')}
        className="shrink-0 text-xs font-black uppercase tracking-wider bg-white text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
      >
        Actualizar pago
      </button>
    </div>
  );
});

export default PaymentFailedBanner;
