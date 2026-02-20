
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    authService.upgradeToPremium();
    onSuccess();
    onClose();
    navigate('/upgrade');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.3)] border border-gold/20 animate-in zoom-in duration-300">
        <div className="bg-gold-shimmer h-32 flex items-center justify-center">
           <span className="material-symbols-outlined text-white text-6xl drop-shadow-lg">luminous_descriptions</span>
        </div>
        
        <div className="p-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">El Loto Dorado</h2>
          <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px] mb-8">El Camino de la Conexión Total</p>
          
          <div className="space-y-6 mb-10 text-left w-full">
             <div className="flex gap-4 items-start">
                <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center text-gold"><span className="material-symbols-outlined text-lg">record_voice_over</span></div>
                <div><p className="text-sm font-bold">Voz de SanArte</p><p className="text-xs text-gray-500">Escucha tus meditaciones con voz de IA humana.</p></div>
             </div>
             <div className="flex gap-4 items-start">
                <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center text-gold"><span className="material-symbols-outlined text-lg">visibility</span></div>
                <div><p className="text-sm font-bold">Sin Velo Místico</p><p className="text-xs text-gray-500">Acceso total a reprogramación y guías celestiales.</p></div>
             </div>
             <div className="flex gap-4 items-start">
                <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center text-gold"><span className="material-symbols-outlined text-lg">all_inclusive</span></div>
                <div><p className="text-sm font-bold">Conciencia Infinita</p><p className="text-xs text-gray-500">Mensajes ilimitados con el Asistente SanArte AI.</p></div>
             </div>
          </div>
          
          <button 
            onClick={handleUpgrade}
            className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all mb-4"
          >
            Suscribirme por $9.99/mes
          </button>
          
          <button onClick={onClose} className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600">Tal vez luego</button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
