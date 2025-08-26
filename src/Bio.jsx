import { useEffect, useState, useRef, useCallback } from 'react';
import bioTexts from '../src/data/bioTexts';
import cooperationData from './data/cooperationData';
import './Bio.scss';

const SCROLLABLE_SELECTOR = '.scrollable';

const Bio = () => {
  const [lang, setLang] = useState('fr');
  const [fade, setFade] = useState('fade-in');
  const [scrolled, setScrolled] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCooperation, setShowCooperation] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [cooperationFading, setCooperationFading] = useState(false);
  const [videoFading, setVideoFading] = useState(false);

  const accumulatedDelta = useRef(0);
  const threshold = 100;
  const originalStyles = useRef({});
  const scrolledRef = useRef(false);
  const bioMainRef = useRef(null);

  useEffect(() => {
    scrolledRef.current = scrolled;
  }, [scrolled]);

  const toggleLanguage = () => {

    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  const closeCooperation = () => {
    setCooperationFading(true);
    setTimeout(() => {
      setShowCooperation(false);
      setCooperationFading(false);
    }, 300);
  };

  const closeVideo = () => {
    setVideoFading(true);
    setTimeout(() => {
      setShowVideo(false);
      setVideoFading(false);
    }, 300);
  };

  const handleClickOutside = useCallback((e) => {
    if (!isInitialized || !scrolledRef.current) return;
    if (bioMainRef.current && !bioMainRef.current.contains(e.target)) {
      setScrolled(false);
      setShowParagraph(false);
    }
  }, [isInitialized]);

  const handleWheel = useCallback((e) => {
    if (!isInitialized) return;
    if (e.target.closest(SCROLLABLE_SELECTOR)) {
      const el = e.target.closest(SCROLLABLE_SELECTOR);
      const { scrollTop, scrollHeight, clientHeight } = el;
      if ((e.deltaY > 0 && scrollTop < scrollHeight - clientHeight) || (e.deltaY < 0 && scrollTop > 0)) return;
    }
    if (e.deltaY > 0 && !scrolledRef.current) {
      e.preventDefault();
      e.stopPropagation();
      accumulatedDelta.current += e.deltaY;
      if (Math.abs(accumulatedDelta.current) > threshold) {
        setScrolled(true);
        setShowParagraph(true);
        accumulatedDelta.current = 0;
      }
    }
  }, [isInitialized]);

  const handleKeyDown = useCallback((e) => {
    if (!isInitialized) return;
    if (e.target.closest(SCROLLABLE_SELECTOR) && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return;

    switch (e.key) {
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        e.stopPropagation();
        if (!scrolledRef.current) {
          setScrolled(true);
          setShowParagraph(true);
        }
        break;
      case 'Home':
        e.preventDefault();
        e.stopPropagation();
        setScrolled(false);
        setShowParagraph(false);
        break;
      case 'End':
        e.preventDefault();
        e.stopPropagation();
        setScrolled(true);
        setShowParagraph(true);
        break;
      default:
        break;
    }
  }, [isInitialized]);

  const handleTouchStart = useCallback((e) => {
    if (!isInitialized) return;
    e.startY = e.touches[0].clientY;
  }, [isInitialized]);

  const handleTouchMove = useCallback((e) => {
    if (!isInitialized) return;
    if (e.target.closest(SCROLLABLE_SELECTOR)) return;
    const currentY = e.touches[0].clientY;
    const deltaY = e.startY - currentY;
    if (deltaY > 50 && !scrolledRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setScrolled(true);
      setShowParagraph(true);
      e.startY = currentY;
    }
  }, [isInitialized]);

  const preventScroll = useCallback((e) => {
    if (e.target.closest(SCROLLABLE_SELECTOR)) return;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      originalStyles.current = {
        bodyOverflow: document.body.style.overflow,
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
        bodyLeft: document.body.style.left,
        bodyWidth: document.body.style.width,
        bodyHeight: document.body.style.height,
        htmlOverflow: document.documentElement.style.overflow,
        bodyScrollBehavior: document.body.style.scrollBehavior
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
      setIsInitialized(true);
    }, 100);

    let startY = 0;
    const wrappedTouchStart = (e) => {
      startY = e.touches[0].clientY;
      handleTouchStart(e);
    };
    const wrappedTouchMove = (e) => {
      e.startY = startY;
      handleTouchMove(e);
    };

    const addListeners = () => {
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      document.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      document.addEventListener('touchstart', wrappedTouchStart, { passive: false, capture: true });
      document.addEventListener('touchmove', wrappedTouchMove, { passive: false, capture: true });
      document.addEventListener('keydown', handleKeyDown, { passive: false, capture: true });
      document.addEventListener('click', handleClickOutside, { passive: false, capture: true });
      window.addEventListener('scroll', preventScroll, { passive: false, capture: true });
    };

    const listenerTimeout = setTimeout(addListeners, 150);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(listenerTimeout);
      const s = originalStyles.current;
      document.body.style.overflow = s.bodyOverflow || '';
      document.body.style.position = s.bodyPosition || '';
      document.body.style.top = s.bodyTop || '';
      document.body.style.left = s.bodyLeft || '';
      document.body.style.width = s.bodyWidth || '';
      document.body.style.height = s.bodyHeight || '';
      document.body.style.scrollBehavior = s.bodyScrollBehavior || '';
      document.documentElement.style.overflow = s.htmlOverflow || '';
      document.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('scroll', preventScroll, { capture: true });
      document.removeEventListener('touchstart', wrappedTouchStart, { capture: true });
      document.removeEventListener('touchmove', wrappedTouchMove, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('click', handleClickOutside, { capture: true });
      window.removeEventListener('scroll', preventScroll, { capture: true });
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, preventScroll, handleClickOutside]);

  useEffect(() => {
    const closeOnEsc = (e) => {
      if (e.key === 'Escape') {
        if (showVideo) closeVideo();
        if (showCooperation) closeCooperation();
      }
    };
    document.addEventListener('keydown', closeOnEsc);
    return () => document.removeEventListener('keydown', closeOnEsc);
  }, [showVideo, showCooperation]);

  return (
    <section className="bio-section">
      <div className={`bio-container ${showCooperation ? 'collab-open' : ''}`}>
        <div className={`bio-picture ${(scrolled || showCooperation || showVideo) ? 'blurred' : ''}`} style={{ backgroundImage: `url('/bio.jpg')` }} />

        {/* ----- Overlay Collaboration (réorganisé) ----- */}
        {showCooperation && (
          <div className={`bio-overlay collaboration-overlay ${cooperationFading ? 'fade-out' : ''}`} onClick={(e) => {
            if (e.target.classList.contains('bio-overlay')) closeCooperation();
          }}>
            <div className="bio-popup-wrapper">
              <div className="bio-cooperation-content scrollable">
                {cooperationData[lang].map(({ category, items }) => (
                  <section key={category} className="cooperation-category">
                    <h4>{category}</h4>
                    <ul>
                      {items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
            <div className='back-to-bio'>
              <button className="back-to-bio-button" onClick={closeCooperation}>
                {bioTexts.buttons[lang].backToBio}
              </button>
            </div>
          </div>
        )}

        {/* ----- Overlay Vidéo ----- */}
        {showVideo && !showCooperation && (
          <div className={`bio-overlay ${videoFading ? 'fade-out' : ''}`} onClick={(e) => {
            if (e.target.classList.contains('bio-overlay')) closeVideo();
          }}>
            <div className="bio-popup-wrapper">
              <video controls autoPlay width="100%" poster="bio_play.png">
                <source src="https://www.dropbox.com/scl/fi/e18ww9z5mw14rgdrfu00v/Partition-d-un-Reve-VF.mov?rlkey=b987olus6c9shxmlt1lxoytu1&raw=1" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéo.
              </video>
              <button className="bio-btn back-to-bio-video" onClick={closeVideo}>
                {bioTexts.buttons[lang].backToBio}
              </button>
            </div>
          </div>
        )}

        {/* ----- Contenu principal ----- */}
        {!showVideo && !showCooperation && (
          <>
            <div className={`bio-titles ${scrolled ? 'hide-title' : ''}`}>
              <div className="bio-title"><h1>bio</h1></div>
              <div className="bio-line" />
            </div>

            <div ref={bioMainRef} className={`bio-main ${showParagraph ? 'show-paragraph' : 'hide-paragraph'}`}>
              <div className={`bio-paragraph scrollable ${fade}`}>
                {bioTexts[lang].map((p, i) => (
                  <p key={i} className={scrolled ? 'home-fade-in-text' : ''}>{p}</p>
                ))}
              </div>

              <div className="bio-title-description" onClick={toggleLanguage}>
                <h5>{lang === 'fr' ? 'Cliquez ici pour la version Anglaise' : 'Click here for French version'}</h5>
                <img src={lang === 'fr' ? 'english-logo.png' : 'french-logo.png'} alt="" />
              </div>

              <div className="bio-buttons">
                <button className="bio-btn" onClick={() => setShowCooperation(true)}>
                  {bioTexts.buttons[lang].collaboration}
                </button>
                <button className="bio-btn" onClick={() => setShowVideo(true)}>
                  {bioTexts.buttons[lang].video}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Bio;