import './JukeboxHome.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from './fetchApi';

const JukeboxHome = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await fetchApi("http://localhost:5001/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            console.log("login response:", data);

            if (data.success) {
                setError('');
                navigate('/admin/add');
            } else {
                setError('Identifiants incorrects');
            }
        } catch (err) {
            console.error("Erreur login:", err);
            setError('Erreur serveur ou réseau, réessayez plus tard');
        }
    };

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