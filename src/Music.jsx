import { useRef, useState, useEffect } from 'react';
import MusicPlayer from './MusicPlayer';
import musicTexts from './data/musicTexts';
import './Music.scss';

const Music = () => {
    const [activePlayerId, setActivePlayerId] = useState(null);
    const [playingPlayerId, setPlayingPlayerId] = useState(null);
    const [lang, setLang] = useState('fr');

    // 🔥 Nouveau : state pour les musiques venant du backend
    const [uploadedFiles, setUploadedFiles] = useState([[], [], []]);

    const playerRefs = [useRef(null), useRef(null), useRef(null)];

    // Charger les musiques au montage
    useEffect(() => {
        const loadTracksForAllPlayers = async () => {
            try {
                for (let i = 0; i < 3; i++) {
                    const lecteurName = `lecteur${i + 1}`;
                    const response = await fetch(`/api/tracks?lecteur=${lecteurName}`);

                    if (response.ok) {
                        const data = await response.json();
                        if (data.tracks && data.tracks.length > 0) {
                            const formattedTracks = data.tracks.map(track => ({
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
                        }
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
                                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                                style={{ cursor: 'pointer' }}
                            >
                                <h5>{musicTexts[lang].switchLang}</h5>
                                <img src="english-logo.png" alt="" />
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
                                    hideImageInput={true} // 🔥 input masqué côté front
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