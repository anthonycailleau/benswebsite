import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import './MenuBar.scss';

const MenuBar = () => {
  const [lang, setLang] = useState('fr');
  const [fade, setFade] = useState('');
  const [visible, setVisible] = useState(true);
  const prevScrollY = useRef(0);
  const timeoutRef = useRef(null);

  const handleLangToggle = () => {
    setFade('fade-out');
    setTimeout(() => {
      setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
      setFade('fade-in');
    }, 300);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Détection du sens de scroll
      if (currentScrollY > prevScrollY.current && currentScrollY > 50) {
        // Scroll vers le bas → cacher immédiatement
        setVisible(false);
      } else {
        // Scroll vers le haut → afficher
        setVisible(true);
      }

      // Réinitialisation du timeout d’inactivité
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Cacher automatiquement après 1 seconde sans scroll
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 3000);

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`menu-bar-container ${visible ? 'visible' : 'hidden'}`}>
      <div className={`menu-bar-tabs ${fade}`}>
        <Link to="home" smooth={true} duration={500}><button>{lang === 'fr' ? 'Accueil' : 'Home'}</button></Link>
        <Link to="bio" smooth={true} duration={500}><button>{lang === 'fr' ? 'Bio' : 'About'}</button></Link>
        <Link to="music" smooth={true} duration={500}><button>{lang === 'fr' ? 'Musique' : 'Music'}</button></Link>
        <Link to="studio" smooth={true} duration={500}><button>{lang === 'fr' ? 'Studio' : 'Studio'}</button></Link>
        <Link to="contact" smooth={true} duration={500}><button>{lang === 'fr' ? 'Contact' : 'Contact'}</button></Link>
        <div className='logo-translate' onClick={handleLangToggle} style={{ cursor: 'pointer' }}>
          <img src={lang === 'en' ? 'french-logo.png' : 'english-logo.png'} alt="logo de traduction français-anglais" />
        </div>
      </div>
      <div className='menu-bar-line'></div>
    </div>
  );
};

export default MenuBar;