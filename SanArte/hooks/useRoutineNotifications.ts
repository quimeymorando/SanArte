import { useEffect, useRef } from 'react';
import { INITIAL_ROUTINES, sendNotification } from '../services/routineService';

export const useRoutineNotifications = () => {
  const lastCheckMinute = useRef<string>('');

  useEffect(() => {
    const checkRoutines = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      // Avoid checking multiple times in the same minute
      if (currentTime === lastCheckMinute.current) return;
      lastCheckMinute.current = currentTime;

      INITIAL_ROUTINES.forEach(routine => {
        if (routine.time === currentTime) {
          sendNotification(
            `¡Es hora de ${routine.text}! 🌿`,
            `Tu rutina de las ${routine.time} te espera. Tómate un momento para ti.`
          );
        }
      });
    };

    // Check every 20 seconds to catch the minute change reliably
    const interval = setInterval(checkRoutines, 20000);
    
    // Initial check
    checkRoutines();

    return () => clearInterval(interval);
  }, []);
};