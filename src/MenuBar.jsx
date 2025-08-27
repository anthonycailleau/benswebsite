import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MenuBar.scss';

const MenuBar = () => {
  const [lang, setLang] = useState('fr');
  const [fade, setFade] = useState('');
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const handleLangToggle = () => {
    setFade('fade-out');
    setTimeout(() => {
      setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
      setFade('fade-in');
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`menu-bar-container ${visible ? 'fade-in' : ''}`}>
      <div className={`menu-bar-tabs ${fade}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          {lang === 'fr' ? 'Accueil' : 'Home'}
        </Link>
        <Link to="/bio" className={location.pathname === '/bio' ? 'active' : ''}>
          {lang === 'fr' ? 'Bio' : 'About'}
        </Link>
        <Link to="/music" className={location.pathname === '/music' ? 'active' : ''}>
          {lang === 'fr' ? 'Musique' : 'Music'}
        </Link>
        <Link to="/studio" className={location.pathname === '/studio' ? 'active' : ''}>
          {lang === 'fr' ? 'Studio' : 'Studio'}
        </Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
          {lang === 'fr' ? 'Contact' : 'Contact'}
        </Link>
      </div>
    </div>
  );
};

export default MenuBar;