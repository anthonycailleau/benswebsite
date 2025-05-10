import MusicPlayer from './MusicPlayer';
import { useRef, useState } from 'react';
import './Music.scss';

const Music = () => {
    const [activePlayerId, setActivePlayerId] = useState(null);
    const [playingPlayerId, setPlayingPlayerId] = useState(null);

    const playerRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
    ]

    const scrollToPlayer = (index) => {
        setActivePlayerId(index+1);
        playerRefs[index].current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', // Évite le scroll vertical 
            inline: 'start', // Scroll horizontal vers la gauche
        });
    };

    return (
        <section>
            <div className='music-container'>
                <div className='music-header'>
                    <div className='music-header-mobile-landscape'>
                        <div className='music-picture'>
                            <img src="musique_carré.png
                    " alt="photo de Ben Bridgen regardant vers le haut" />
                        </div>
                        <div className='music-titles'>
                            <div className='music-title'>
                                <h1>musique</h1>
                            </div>
                            <div className='music-line'></div>
                            <div className='music-title-description'>
                                <h5> Cliquez ici pour la version anglaise</h5>
                                <img src="english-logo.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='music-main'>

                    <div className='music-player-music-contain'>
                        <div className='music-button-container'>
                            <button onClick={() => scrollToPlayer(0)}>Lecteur 1</button>
                            <button onClick={() => scrollToPlayer(1)}>Lecteur 2</button>
                            <button onClick={() => scrollToPlayer(2)}>Lecteur 3</button>

                        </div>
                        <div className='music-carousel'>
                            <MusicPlayer
                                themeColor="white"
                                id={1}
                                activePlayerId={activePlayerId}
                                setActivePlayerId={setActivePlayerId}
                                playingPlayerId={playingPlayerId}
                                setPlayingPlayerId={setPlayingPlayerId}
                                playerRefs={playerRefs}
                                ref={playerRefs[0]}
                            />
                            <MusicPlayer
                                themeColor="turquoise"
                                id={2}
                                activePlayerId={activePlayerId}
                                setActivePlayerId={setActivePlayerId}
                                playingPlayerId={playingPlayerId}
                                setPlayingPlayerId={setPlayingPlayerId}
                                playerRefs={playerRefs}
                                ref={playerRefs[1]}
                            />
                            <MusicPlayer
                                themeColor="orange"
                                id={3}
                                activePlayerId={activePlayerId}
                                setActivePlayerId={setActivePlayerId}
                                playingPlayerId={playingPlayerId}
                                setPlayingPlayerId={setPlayingPlayerId}
                                playerRefs={playerRefs}
                                ref={playerRefs[2]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>


    );
};

export default Music; 