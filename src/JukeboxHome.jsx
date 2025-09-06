import './JukeboxHome.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from './fetchApi.js';
import useAutoLogout from './hooks/useAutoLogout'; // Import du hook

const JukeboxHome = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Déconnexion automatique après 5 minute d'inactivité
    const manualLogout = useAutoLogout(5 * 60 * 1000);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset l'erreur
        
        console.log("Tentative de connexion avec:", { email, password: "***" });
        
        try {
            console.log("URL appelée:", "/api/login");
            
            const data = await fetchApi("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            console.log("login response:", data);
            console.log("Type de data:", typeof data);
            console.log("Keys de data:", Object.keys(data || {}));

            if (data.ok && data.data?.success) {
                // Stocker le token ou juste un flag
                localStorage.setItem('token', data.data.token || 'connected');
                setError('');
                navigate('/admin/add');
            } else {
                console.log("Échec connexion - data.ok:", data.ok, "data.data:", data.data);
                setError('Identifiants incorrects');
            }
        } catch (err) {
            console.error("Erreur login complète:", err);
            console.error("Message d'erreur:", err.message);
            console.error("Stack:", err.stack);
            
            // Messages d'erreur plus spécifiques
            if (err.message.includes('fetch')) {
                setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
            } else if (err.message.includes('JSON')) {
                setError('Erreur de format de données du serveur.');
            } else {
                setError(`Erreur: ${err.message}`);
            }
        }
    };

    const handleManualLogout = () => {
        manualLogout();
    };

    // Vérifier si déjà connecté
    const isLoggedIn = localStorage.getItem('token');

    return (
        <div className='jukebox-home-container'>
            <div className='jukebox-home-header'>
                <div className='jukebox-home-main'>
                    <div className='jukebox-home-titles'>
                        <div className='jukebox-home-title'>
                            <h1>Jukebox</h1>
                        </div>
                        <div className='jukebox-home-title-line'></div>
                    </div>
                    <div className='jukebox-home-user-titles'>
                        <div className='jukebox-home-user-title'>
                            <h4>Administrateur</h4>
                        </div>
                        <div className='jukebox-home-line'></div>
                    </div>
                    <div className='jukebox-home-contact-content'>
                        <div className='jukebox-home-contact-form'>
                            {isLoggedIn && (
                                <div className="logout-section" style={{ marginBottom: '20px', textAlign: 'center' }}>
                                    <p style={{ color: '#666', fontSize: '14px' }}>
                                        Vous êtes connecté. Déconnexion automatique après 1 min d'inactivité.
                                    </p>
                                    <button 
                                        className='jukebox-home-button logout-button' 
                                        onClick={handleManualLogout}
                                        type="button"
                                        style={{ marginTop: '10px' }}
                                    >
                                        Déconnexion manuelle
                                    </button>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email"> Email </label>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        placeholder="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password"> Mot de Passe</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="mot de passe"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                {error && <p className="error-message">{error}</p>}

                                <button className='jukebox-home-button' type="submit">
                                    Connexion
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JukeboxHome;