import { useEffect, useState, useRef, useCallback } from 'react';
import homeTexts from './data/homeTexts';
import './Home.scss';

const SCROLLABLE_SELECTOR = '.scrollable'; // Zone scrollable interne

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lang, setLang] = useState('fr');       // Pour le titre qui change automatiquement
  const [langDesc, setLangDesc] = useState('fr'); // Pour le texte du bouton qui change au clic
  const scrolledRef = useRef(false);
  const accumulatedDelta = useRef(0);
  const threshold = 100;
  const originalStyles = useRef({});
  const homeMainRef = useRef(null);

  // Toggle manuel pour la langue du bouton en bas
  const toggleLanguageDesc = () => {
    setLangDesc((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  // Synchronisation ref
  useEffect(() => {
    scrolledRef.current = scrolled;
  }, [scrolled]);

  // Changement automatique de langue pour le titre toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setLang((current) => (current === 'fr' ? 'en' : 'fr'));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Gérer scroll souris
  const handleWheel = useCallback(
    (e) => {
      if (!isInitialized) return;

      if (e.target.closest(SCROLLABLE_SELECTOR)) {
        const el = e.target.closest(SCROLLABLE_SELECTOR);
        const { scrollTop, scrollHeight, clientHeight } = el;
        if (
          (e.deltaY > 0 && scrollTop < scrollHeight - clientHeight) ||
          (e.deltaY < 0 && scrollTop > 0)
        )
          return; // scroll interne géré naturellement
      }

      if (e.deltaY > 0 && !scrolledRef.current) {
        e.preventDefault();
        accumulatedDelta.current += e.deltaY;
        if (Math.abs(accumulatedDelta.current) > threshold) {
          setScrolled(true);
          setShowParagraph(true);
          accumulatedDelta.current = 0;
        }
      } else if (e.deltaY < 0 && scrolledRef.current) {
        e.preventDefault();
        accumulatedDelta.current += e.deltaY;
        if (Math.abs(accumulatedDelta.current) > threshold) {
          setScrolled(false);
          setShowParagraph(false);
          accumulatedDelta.current = 0;
        }
      }
    },
    [isInitialized]
  );

  // Gestion clavier simple
  const handleKeyDown = useCallback(
    (e) => {
      if (!isInitialized) return;

      if (
        e.target.closest(SCROLLABLE_SELECTOR) &&
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)
      )
        return; // laisse gérer scrollable

      switch (e.key) {
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          if (!scrolledRef.current) {
            setScrolled(true);
            setShowParagraph(true);
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (scrolledRef.current) {
            setScrolled(false);
            setShowParagraph(false);
          }
          break;
        case 'Home':
          e.preventDefault();
          setScrolled(false);
          setShowParagraph(false);
          break;
        case 'End':
          e.preventDefault();
          setScrolled(true);
          setShowParagraph(true);
          break;
      }
    },
    [isInitialized]
  );

  // Gestion tactile
  const handleTouchStart = useCallback(
    (e) => {
      if (!isInitialized) return;
      e.startY = e.touches[0].clientY;
    },
    [isInitialized]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isInitialized) return;

      if (e.target.closest(SCROLLABLE_SELECTOR)) return;

      const currentY = e.touches[0].clientY;
      const deltaY = e.startY - currentY;

      if (deltaY > 50 && !scrolledRef.current) {
        e.preventDefault();
        setScrolled(true);
        setShowParagraph(true);
        e.startY = currentY;
      } else if (deltaY < -50 && scrolledRef.current) {
        e.preventDefault();
        setScrolled(false);
        setShowParagraph(false);
        e.startY = currentY;
      }
    },
    [isInitialized]
  );

  // Gestion click en dehors pour retour titre
  const handleClickOutside = useCallback(
    (e) => {
      if (!isInitialized || !scrolledRef.current) return;
      if (homeMainRef.current && !homeMainRef.current.contains(e.target)) {
        setScrolled(false);
        setShowParagraph(false);
      }
    },
    [isInitialized]
  );

  // Blocage scroll global **uniquement si scrolled est true**
  useEffect(() => {
    if (!scrolled) {
      const s = originalStyles.current;
      if (s) {
        document.body.style.overflow = s.bodyOverflow || '';
        document.body.style.position = s.bodyPosition || '';
        document.body.style.top = s.bodyTop || '';
        document.body.style.left = s.bodyLeft || '';
        document.body.style.width = s.bodyWidth || '';
        document.body.style.height = s.bodyHeight || '';
        document.body.style.scrollBehavior = s.bodyScrollBehavior || '';
        document.documentElement.style.overflow = s.htmlOverflow || '';
      }
      setIsInitialized(true);
      return;
    }

    originalStyles.current = {
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyWidth: document.body.style.width,
      bodyHeight: document.body.style.height,
      htmlOverflow: document.documentElement.style.overflow,
      bodyScrollBehavior: document.body.style.scrollBehavior,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.scrollBehavior = 'auto';
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const preventScroll = (e) => {
      if (e.target.closest(SCROLLABLE_SELECTOR)) return;
      e.preventDefault();
    };

    document.addEventListener('wheel', preventScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
    window.addEventListener('scroll', preventScroll, { passive: false, capture: true });

    setIsInitialized(true);

    return () => {
      document.removeEventListener('wheel', preventScroll, { capture: true });
      document.removeEventListener('touchmove', preventScroll, { capture: true });
      window.removeEventListener('scroll', preventScroll, { capture: true });

      const s = originalStyles.current;
      document.body.style.overflow = s.bodyOverflow || '';
      document.body.style.position = s.bodyPosition || '';
      document.body.style.top = s.bodyTop || '';
      document.body.style.left = s.bodyLeft || '';
      document.body.style.width = s.bodyWidth || '';
      document.body.style.height = s.bodyHeight || '';
      document.body.style.scrollBehavior = s.bodyScrollBehavior || '';
      document.documentElement.style.overflow = s.htmlOverflow || '';
    };
  }, [scrolled]);

  // Listeners init
  useEffect(() => {
    let startY = 0;
    const wrappedTouchStart = (e) => {
      startY = e.touches[0].clientY;
      handleTouchStart(e);
    };
    const wrappedTouchMove = (e) => {
      e.startY = startY;
      handleTouchMove(e);
    };

    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    document.addEventListener('keydown', handleKeyDown, { passive: false, capture: true });
    document.addEventListener('touchstart', wrappedTouchStart, { passive: false, capture: true });
    document.addEventListener('touchmove', wrappedTouchMove, { passive: false, capture: true });
    document.addEventListener('click', handleClickOutside, { passive: false, capture: true });

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('touchstart', wrappedTouchStart, { capture: true });
      document.removeEventListener('touchmove', wrappedTouchMove, { capture: true });
      document.removeEventListener('click', handleClickOutside, { capture: true });
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, handleClickOutside]);

  return (
    <section id="home">
      <div className="home-container" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <div
          className={`home-picture ${scrolled ? 'blurred' : ''}`}
          style={{
            backgroundImage: `url('/home.jpg')`,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: scrolled ? 'blur(3px)' : 'none',
            transition: 'filter 0.5s ease',
          }}
        />

        <div
          className={`home-titles ${scrolled ? 'hide-title' : ''}`}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            textAlign: 'center',
            zIndex: 1,
            transition: 'opacity 1s ease, transform 1s ease',
            opacity: scrolled ? 0 : 1,
            pointerEvents: scrolled ? 'none' : 'auto',
          }}
        >
          <h1>ben bridgen</h1>
          <div className="home-line" style={{ height: '2px', backgroundColor: 'white', margin: '2px 15px', boxShadow: '3px 3px 10px rgba(0,0,0,0.8)' }} />

          {/* Titre qui change automatiquement de langue */}
          <h3 className="fade-text">
            <span className={lang === 'fr' ? 'active' : ''}>musicien compositeur arrangeur</span>
            <span className={lang === 'en' ? 'active' : ''}>musician composer arranger</span>
          </h3>
        </div>

        {showParagraph && (
          <div className="home-paragraph-wrapper" ref={homeMainRef}>
            <div className={`home-main ${showParagraph ? 'show-paragraph' : 'hide-paragraph'}`}>
              <p>
                <span className={showParagraph ? "home-fade-in-text" : ""}>
                  {homeTexts[langDesc].paragraph}
                </span>
              </p>
            </div>

            <div className="home-title-description" onClick={toggleLanguageDesc} style={{ justifyContent: 'flex-end' }}>
              <h5>{langDesc === 'fr' ? 'Cliquez ici pour la version Anglaise' : 'Click here for French version'}</h5>
              <img
                src={langDesc === 'fr' ? './english-logo.png' : './french-logo.png'}
                alt="language switch"
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Home;