import './JukeboxHome.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JukeboxHome = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("login response:", data);

      if (data.success) {
        setError('');
        navigate('/admin/add'); // Assure-toi que cette route existe
      } else {
        setError(data.error || 'Identifiants incorrects');
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
            <h1>Jukebox</h1>
          </div>

          <div className='jukebox-home-user-titles'>
            <h4>Administrateur</h4>
          </div>

          <div className='jukebox-home-contact-content'>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label htmlFor="password">Mot de Passe</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="error-message">{error}</p>}

              <button className='jukebox-home-button' type="submit">
                Connexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JukeboxHome;