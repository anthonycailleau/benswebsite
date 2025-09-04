import { useState, useEffect, useRef } from 'react';
import equipmentData from './data/equipmentData';
import studioTexts from './data/studioTexts';
import './Studio.scss';

const images = [
  'Alice_Mullen_01.jpg', 'Alice_Mullen_02.jpg', 'Alice_Mullen_03.jpg',
  'Ernest_Mandap_01.jpg', 'Ernest_Mandap_02.jpg', 'Ernest_Mandap_03.jpg',
  'Ernest_Mandap_04.jpg', 'Ernest_Mandap_05.jpg',
  'Goulwen_Gélin_01.jpg', 'Goulwen_Gélin_02.jpg', 'Goulwen_Gélin_03.jpg',
  'Laetitia_Lopez_01.jpg',
  'Loic_Le_Moullec_01.jpg', 'Loic_Le_Moullec_02.jpg', 'Loic_Le_Moullec_03.jpg', 'Loic_Le_Moullec_04.jpg',
  '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg'
];

const Studio = () => {
  const [view, setView] = useState(null);
  const [overlayFading, setOverlayFading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [lang, setLang] = useState('fr');
  // Suppression de isLoading - la page s'affiche directement

  const intervalRef = useRef(null);
  const popupRef = useRef(null);
  const carouselRef = useRef(null);
  const dragRef = useRef(null);

  const imageCredits = {
    'Alice_Mullen_01.jpg': '© Alice Mullen',
    'Alice_Mullen_02.jpg': '© Alice Mullen',
    'Alice_Mullen_03.jpg': '© Alice Mullen',
    'Ernest_Mandap_01.jpg': '© Ernest Mandap',
    'Ernest_Mandap_02.jpg': '© Ernest Mandap',
    'Ernest_Mandap_03.jpg': '© Ernest Mandap',
    'Ernest_Mandap_04.jpg': '© Ernest Mandap',
    'Ernest_Mandap_05.jpg': '© Ernest Mandap',
    'Goulwen_Gélin_01.jpg': '© Goulwen Gélin',
    'Goulwen_Gélin_02.jpg': '© Goulwen Gélin',
    'Goulwen_Gélin_03.jpg': '© Goulwen Gélin',
    'Laetitia_Lopez_01.jpg': '© Laetitia Lopez',
    'Loic_Le_Moullec_01.jpg': '© Loïc Le Moullec',
    'Loic_Le_Moullec_02.jpg': '© Loïc Le Moullec',
    'Loic_Le_Moullec_03.jpg': '© Loïc Le Moullec',
    'Loic_Le_Moullec_04.jpg': '© Loïc Le Moullec',
  };

  /* ---------- PRÉCHARGEMENT OPTIONNEL EN ARRIÈRE-PLAN ---------- */
  useEffect(() => {
    // Préchargement en arrière-plan sans bloquer l'affichage
    images.forEach(src => {
      const img = new Image();
      img.src = `/${src}`;
      // Pas de callback onload nécessaire
    });
  }, []);

  /* ---------- AUTOPLAY ---------- */
  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => setFade(false), 6000);
  };

  useEffect(() => {
    if (isAutoPlay) startAutoPlay();
    return () => clearInterval(intervalRef.current);
  }, [isAutoPlay]);

  useEffect(() => {
    if (view === 'diaporama') setIsAutoPlay(true);
    else {
      setIsAutoPlay(false);
      clearInterval(intervalRef.current);
      setCurrentIndex(0);
    }
  }, [view]);

  useEffect(() => {
    if (!fade) {
      const t = setTimeout(() => {
        setCurrentIndex(i => (i + 1) % images.length);
        setFade(true);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [fade]);

  /* ---------- CLOSE OVERLAY ---------- */
  const closeOverlay = () => {
    setOverlayFading(true);
    setTimeout(() => {
      setView(null);
      setOverlayFading(false);
    }, 300);
  };

  /* ---------- DRAG / SWIPE THUMBNAILS ---------- */
  useEffect(() => {
    const slider = dragRef.current;
    if (!slider) return;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const mouseDown = e => {
      isDragging = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      slider.classList.add('dragging');
    };
    const mouseMove = e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX);
    };
    const mouseUp = () => {
      isDragging = false;
      slider.classList.remove('dragging');
    };
    const touchStart = e => {
      isDragging = true;
      startX = e.touches[0].pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const touchMove = e => {
      if (!isDragging) return;
      const x = e.touches[0].pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX);
    };
    const touchEnd = () => {
      isDragging = false;
    };

    slider.addEventListener('mousedown', mouseDown);
    slider.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);

    slider.addEventListener('touchstart', touchStart);
    slider.addEventListener('touchmove', touchMove);
    window.addEventListener('touchend', touchEnd);

    return () => {
      slider.removeEventListener('mousedown', mouseDown);
      slider.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);

      slider.removeEventListener('touchstart', touchStart);
      slider.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
    };
  }, []);

  /* ---------- RENDER ---------- */
  // Suppression de la condition isLoading - affichage direct
  return (
    <div className={`studio-container ${view ? 'popup-open' : ''}`}>
      {/* Background */}
      <div className={`studio-picture ${view ? 'blurred' : ''}`} style={{ backgroundImage: `url('/studio.jpg')` }} />

      {/* Header + Intro */}
      {!view && (
        <>
          <div className="studio-header">
            <div className="studio-picture" />
            <div className="studio-titles">
              <h1>{studioTexts[lang].title}</h1>
              <div className="studio-line" />
              <div className="studio-title-description" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} style={{ cursor: 'pointer' }}>
                <h5>{studioTexts[lang].switchLang}</h5>
                <img src={lang === 'fr' ? 'english-logo.png' : 'french-logo.png'} alt="" />
              </div>
            </div>
          </div>

          <div className="studio-paragraph">
            {studioTexts[lang].paragraph.map((text, i) => <p key={i}>{text}</p>)}
          </div>

          <div className="studio-buttons">
            <button className="studio-btn" onClick={() => setView('equipment')}>{studioTexts[lang].buttons.equipment}</button>
            <button className="studio-btn" onClick={() => setView('diaporama')}>{studioTexts[lang].buttons.slideshow}</button>
          </div>
        </>
      )}

      {/* Overlay */}
      {view && (
        <div
          className={`studio-overlay ${overlayFading ? 'fade-out' : ''}`}
          onTouchStart={e => {
            const scrollableElements = [carouselRef.current, popupRef.current];
            const touchedInside = scrollableElements.some(el => el?.contains(e.target));
            if (!touchedInside) closeOverlay();
          }}
        >
          <div ref={popupRef} className="studio-popup-wrapper scrollable">
            {view === 'equipment' && (
              <div
                className="equipment-wrapper"
                onTouchStart={e => e.stopPropagation()}
                onTouchMove={e => e.stopPropagation()}
              >
                {equipmentData[lang].map(({ category, items }) => (
                  <section key={category} className="equipment-category">
                    <h4>{category}</h4>
                    <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
                  </section>
                ))}
              </div>
            )}

            {view === 'diaporama' && (
              <div className="studio-carousel-wrapper" ref={carouselRef}>
                <div className="main-image-container">
                  <img
                    src={images[currentIndex]}
                    alt={`carrousel ${currentIndex + 1}`}
                    className={fade ? 'fade-in' : 'fade-out'}
                  />
                  {imageCredits[images[currentIndex]] && (
                    <div className="image-credit">{imageCredits[images[currentIndex]]}</div>
                  )}
                </div>

                <div className="thumbnail-carousel" ref={dragRef}>
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`thumbnail ${index + 1}`}
                      className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                      loading="lazy" // lazy loading pour optimiser
                      onClick={() => {
                        clearInterval(intervalRef.current);
                        setFade(false);
                        setTimeout(() => {
                          setCurrentIndex(index);
                          setFade(true);
                        }, 150);
                      }}
                    />
                  ))}
                </div>

                <div className="thumbnail-scrollbar-desktop"></div>
              </div>
            )}

            <button
              className={`studio-btn return-btn ${view === 'diaporama' ? 'diaporama-return' : ''}`}
              onClick={closeOverlay}
            >
              {studioTexts[lang].buttons.back}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studio;