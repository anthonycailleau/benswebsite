import { useRef, useState, useEffect } from 'react';
import MusicPlayer from './MusicPlayer';
import musicTexts from './data/musicTexts';
import './Music.scss';
import { fetchApi } from './fetchApi.js';

const Music = () => {
    const [activePlayerId, setActivePlayerId] = useState(null);
    const [playingPlayerId, setPlayingPlayerId] = useState(null);
    const [lang, setLang] = useState('fr'); // état pour la langue

    // 🔥 Nouveau : state pour les musiques venant du backend
    const [uploadedFiles, setUploadedFiles] = useState([[], [], []]);

    const playerRefs = [useRef(null), useRef(null), useRef(null)];

    // Charger les musiques au montage
    useEffect(() => {
        const loadTracksForAllPlayers = async () => {
            try {
                for (let i = 0; i < 3; i++) {
                    const lecteurName = `lecteur${i + 1}`;
                    const result = await fetchApi(`/api/tracks?lecteur=${lecteurName}`);

                    if (result.ok && result.data?.tracks) {
                        const tracks = result.data.tracks;
                        const formattedTracks = tracks.map(track => ({
                            src: track.audio,
                            title: track.title || 'Sans titre',
                            artist: track.artist || '',
                            type: track.type || 'audio/mpeg',
                            imgSrc: track.image || null,
                        }));

                        setUploadedFiles(prev => {
                            const updated = [...prev];
                            updated[i] = formattedTracks;
                            return updated;
                        });
                    } else {
                        setUploadedFiles(prev => {
                            const updated = [...prev];
                            updated[i] = [];
                            return updated;
                        });
                    }
                }
            } catch (err) {
                console.error('Erreur lors du chargement des pistes:', err);
            }
        };

        loadTracksForAllPlayers();
    }, []);

    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    const scrollToPlayer = (index) => {
        setActivePlayerId(index + 1);
        playerRefs[index].current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
        });
    };

    // 🔥 Fonction toggle identique à Contact
    const toggleLanguage = () => {
        setLang(prev => (prev === 'fr' ? 'en' : 'fr'));
    };

    return (
        <section>
            <div className='music-container'>
                <div className='music-header'>
                    <div
                        className="music-picture blurred"
                        style={{ backgroundImage: `url('/music.jpg')` }}
                    />
                    <div className='music-header-mobile-landscape'>
                        <div className='music-titles'>
                            <div className='music-title'>
                                <h1>{musicTexts[lang].title}</h1>
                            </div>
                            <div className='music-line'></div>
                            <div
                                className='music-title-description'
                                onClick={toggleLanguage}
                                style={{ cursor: 'pointer' }}
                            >
                                <h5>{musicTexts[lang].switchLang}</h5>
                                <img
                                    src={lang === 'fr' ? 'english-logo.png' : 'french-logo.png'}
                                    alt="toggle language"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='music-main'>
                    <div className='music-player-music-contain'>
                        <div className='music-button-container'>
                            {musicTexts[lang].buttons.map((label, index) => (
                                <button key={index} onClick={() => scrollToPlayer(index)}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className='music-carousel'>
                            {[1, 2, 3].map((id, index) => (
                                <MusicPlayer
                                    key={id}
                                    themeColor={id === 1 ? 'white' : id === 2 ? 'turquoise' : 'orange'}
                                    id={id}
                                    activePlayerId={activePlayerId}
                                    setActivePlayerId={setActivePlayerId}
                                    playingPlayerId={playingPlayerId}
                                    setPlayingPlayerId={setPlayingPlayerId}
                                    uploadedFile={uploadedFiles[index]}
                                    ref={playerRefs[index]}
                                    hideImageInput={true}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Music;