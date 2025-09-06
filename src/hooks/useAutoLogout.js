// hooks/useAutoLogout.js
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (inactivityTime = 1 * 60 * 1000) => { // 1 minute par défaut
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token'); // Au cas où
        navigate('/admin'); // Redirection vers JukeboxHome
        console.log('Déconnexion automatique - session expirée par inactivité');
    }, [navigate]);

    useEffect(() => {
        let inactivityTimer;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            
            // Vérifier si l'utilisateur est connecté
            const token = localStorage.getItem('token');
            if (token) {
                console.log('Timer reset - prochaine déconnexion dans', inactivityTime/1000, 'secondes');
                inactivityTimer = setTimeout(() => {
                    console.log('DÉCONNEXION AUTOMATIQUE !');
                    logout();
                }, inactivityTime);
            }
        };

        const handleActivity = () => {
            console.log('Activité détectée - timer reset');
            resetTimer();
        };

        // Événements à surveiller
        const events = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 
            'touchstart', 'click', 'keydown'
        ];

        // Démarrer le timer si l'utilisateur est connecté
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Hook useAutoLogout démarré - utilisateur connecté');
            resetTimer();
        }

        // Ajouter les écouteurs d'événements
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Nettoyage au démontage du composant
        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            console.log('Hook useAutoLogout nettoyé');
        };
    }, [logout, inactivityTime]);

    return logout; // Retourne la fonction logout pour déconnexion manuelle
};

export default useAutoLogout;