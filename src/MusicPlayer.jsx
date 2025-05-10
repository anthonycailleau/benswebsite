import { forwardRef, useEffect, useRef, useState } from 'react';
import './MusicPlayer.scss';


const MusicPlayer = forwardRef(({ themeColor, id, activePlayerId, setActivePlayerId, playingPlayerId, setPlayingPlayerId }, ref) => {

    const audioRef = useRef(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    const playlist = [
        {
            title: "Models",
            artist: "Hacienda",
            src: "/test.wav",
            currentTime: 0,
        },
        {
            title: "Did what you say",
            artist: "Hacienda",
            src: "/test-2.wav",
            currentTime: 0,
        },
        {
            title: "Models",
            artist: "Hacienda",
            src: "/test.wav",
            currentTime: 0,
        },
        {
            title: "Models",
            artist: "Hacienda",
            src: "/test.wav",
            currentTime: 0,
        },
        {
            title: "Did what you say",
            artist: "Hacienda",
            src: "/test-2.wav",
            currentTime: 0,
        },
        {
            title: "Models",
            artist: "Hacienda",
            src: "/test.wav",
            currentTime: 0,
        },
        {
            title: "Models",
            artist: "Hacienda",
            src: "/test.wav",
            currentTime: 0,
        },
        {
            title: "Did what you say",
            artist: "Hacienda",
            src: "/test-2.wav",
            currentTime: 0,
        },
        {
            title: "Models",
            artist: "Hacienda",
            src: "/test.wav",
            currentTime: 0,
        },
    ];
    const handleTrackClick = (track, index = null) => {
        if (audioRef.current) {
            if (currentTrack?.src === track.src && isPlaying) {
                // Si le même morceau est en lecture, met en pause
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                // Si un nouveau morceau est sélectionné
                if (currentTrack?.src !== track.src) {
                    audioRef.current.src = track.src;
                    setCurrentTrack(track);
                    if (index !== null) setCurrentTrackIndex(index);
                }
                // Si un morceau est en pause, reprends la lecture à la position actuelle
                audioRef.current.currentTime = currentTrack ? audioRef.current.currentTime : 0;
                audioRef.current.play();
                setIsPlaying(true);
                setPlayingPlayerId(id);
            }
        }
        if (index !== null) {
            setCurrentTrackIndex(index);
            setAnimationKey((prev) => prev + 1);
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                const current = audio.currentTime;
                const duration = audio.duration;
                setCurrentTime(current);
                const percent = (current / duration) * 100;
                setProgress(percent);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, [currentTrack]);

    useEffect(() => {
        if (playingPlayerId !== id && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [playingPlayerId]);

    const handlePrev = () => {
        const newIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        handleTrackClick(playlist[newIndex], newIndex);
    };

    const handleNext = () => {
        const newIndex = (currentTrackIndex + 1) % playlist.length;
        handleTrackClick(playlist[newIndex], newIndex);
    };

    const handleProgressClick = (e) => {
        const audio = audioRef.current;
        if (!audio || !currentTrack || isNaN(audio.duration)) return;

        if (isDragging) return;

        const timeline = e.currentTarget;
        const rect = timeline.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;

        const newTime = (clickX / width) * audio.duration;
        audio.currentTime = newTime;
        setProgress((clickX / width) * 100);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
    };


    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const audio = audioRef.current;
        if (!audio || isNaN(audio.duration) || !isFinite(audio.duration)) return;

        const timeline = e.currentTarget;
        const rect = timeline.getBoundingClientRect();
        const moveX = e.clientX - rect.left;
        const width = rect.width;

        const newTime = (moveX / width) * audio.duration;
        audio.currentTime = newTime;
        setProgress((moveX / width) * 100);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = () => {
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const audio = audioRef.current;
        if (!audio || isNaN(audio.duration) || !isFinite(audio.duration)) return;

        const timeline = e.currentTarget;
        const rect = timeline.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const width = rect.width;

        const newTime = (touchX / width) * audio.duration;
        audio.currentTime = newTime;
        setProgress((touchX / width) * 100);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div className='music-player-container' ref={ref}>
            <audio ref={audioRef} preload='metadata' />
            <div className={`music-player-contain ${themeColor}`}>
                <div className='music-player-top'>
                    <div className='music-player-picture-container'>
                        <div className='music-player-picture'></div>
                        <div className='music-player-artist-container'>
                            <div className='music-player-artist-title'>
                                {currentTrack?.artist}
                            </div>
                            <div className='music-player-track-title'>
                                <span key={animationKey} className="scrolling-text">
                                    {currentTrack?.title}
                                </span>
                            </div>
                        </div>

                    </div>

                    <div className='music-player-timeline-duration'>
                        <div className='music-player-timeline'
                            onClick={handleProgressClick}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div
                                className="music-player-progress"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className='music-player-duration'>
                            {formatTime(currentTime)}
                        </div>
                    </div>

                    <div className='music-player-buttons'>
                        <img src="prev.png" alt="Précédent" onClick={handlePrev} style={{ cursor: 'pointer' }} />
                        <img
                            src={isPlaying ? "pause.png" : "play.png"}
                            alt="Lecture/Pause"
                            onClick={() => {
                                if (currentTrack) {
                                    handleTrackClick(currentTrack);
                                } else {
                                    handleTrackClick(playlist[0]); // ou le morceau par défaut
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                        <img src="next.png" alt="Suivant" onClick={handleNext} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
                <div className='music-player-bottom'>
                    {playlist.map((track, index) => (
                        <div
                            key={index}
                            className='music-player-artist-list-container'
                            onClick={() => handleTrackClick(track, index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className='music-player-title-list'>{track.artist} - </div>
                            <div className='music-player-track-list'>{track.title}</div>
                            <div className='music-player-duration-list'>{track.duration}</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
});

export default MusicPlayer;