import { useState, useEffect, useRef } from 'react';
import './Studio.scss';

const images = ['caroussel_2.jpg', 'caroussel_3.jpg']

const Studio = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const intervalRef = useRef(null);

    // Fonction pour lancer l'autoplay
    const startAutoPlay = () => {
        intervalRef.current = setInterval(() => {
            setFade(false);
        }, 7000);
    };

    useEffect(() => {
        if (isAutoPlay) {
            startAutoPlay();
        }

        return () => clearInterval(intervalRef.current);
    }, [isAutoPlay]);

    useEffect(() => {
        if (!fade) {
            const timeout = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                setFade(true); // une fois l’image changée, on refait apparaître
            }, 1500); // temps du fade-out (doit correspondre au CSS)

            return () => clearTimeout(timeout);
        }
    }, [fade]);

    const handlePrev = () => {
        clearInterval(intervalRef.current);
        setIsAutoPlay(false);
        setFade(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
            setFade(true);
        }, 1500); // Effet de fade même au clic
    };

    const handleNext = () => {
        clearInterval(intervalRef.current);
        setIsAutoPlay(false);
        setFade(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            setFade(true);
        }, 1500);
    };

    return (

        <div className='studio-container'>
            <div className='studio-header'>
                <div className='studio-header-mobile-landscape'>
                    <div className='studio-picture'>
                        <img src="studio_carré.png" alt="photo de Ben Bridgen de profil" />
                    </div>
                    <div className='studio-titles'>
                        <div className='studio-title'>
                            <h1>le studio</h1>
                        </div>
                        <div className='studio-line'></div>
                        <div className='studio-title-description'>
                            <h5>Cliquez ici pour la version anglaise</h5>
                            <img src="english-logo.png" alt="" />
                        </div>
                    </div>
                </div>
                <div className='studio-main'>
                    <div className='studio-caroussel-container'>
                        <div className='studio-caroussel'>
                            <svg width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="white"
                                xmlns="http://www.w3.org/2000/svg"
                                onClick={handlePrev}
                                style={{ cursor: 'pointer' }}
                            >
                                <path d="M15 18L9 12L15 6" fill="white" />
                            </svg>
                            <img
                                src={images[currentIndex]}
                                alt={`carrousel ${currentIndex + 1}`}
                                className={fade ? 'fade-in' : 'fade-out'}
                            />
                            <svg width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="white"
                                xmlns="http://www.w3.org/2000/svg"
                                onClick={handleNext}
                                style={{ cursor: 'pointer' }}
                            >
                                <path d="M9 6L15 12L9 18" fill="white" />
                            </svg>
                        </div>

                        <div className='studio-caroussel-description'>
                            <h5>Description 1</h5>
                            <h6>Détails du matériel</h6>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur incidunt eaque aliquid quaerat ipsum qui suscipit eveniet molestias reiciendis! Et suscipit dignissimos, iusto error laudantium placeat aliquam provident incidunt corporis.</p>
                        </div>
                    </div>
                    <div className='studio-paragraph'>
                        <p>
                            Le studio d’enregistrement [Nom du studio], fondé par Ben Bridgen, est un espace dédié à la création musicale et à la production sonore. Équipé de matériel haut de gamme et d’une acoustique optimisée, il accueille artistes et producteurs pour l’enregistrement, le mixage et le mastering de leurs projets. Son ambiance chaleureuse et son expertise technique en font un lieu incontournable pour donner vie aux idées musicales.
                        </p>
                    </div>
                </div>

            </div>
        </div>

    );
};

export default Studio; 