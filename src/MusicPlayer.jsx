// MusicPlayer.jsx
import { forwardRef, useEffect, useRef, useState } from 'react';
import './MusicPlayer.scss';

const MusicPlayer = forwardRef((
  {
    themeColor,
    id,
    activePlayerId,
    setActivePlayerId,
    playingPlayerId,
    setPlayingPlayerId,
    uploadedFile, // tableau des pistes [{src, title, artist?, type?, isLocalPreview?, imgSrc?, audioFile?}]
    onRemoveTrack, // fonction (track) => suppression piste
    onUpdateTrackImage, // fonction (trackTitle, imageFile) => mise à jour image pour piste uploadée
    onUpdatePreviewImage, // fonction (trackTitle, imageFile) => mise à jour image pour preview
    hideImageInput = false, // prop pour cacher l'input image
  },
  ref
) => {
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [audioError, setAudioError] = useState(null);

  // URL blob actuelle pour piste locale
  const lastBlobUrlRef = useRef(null);

  const playlist = Array.isArray(uploadedFile) && uploadedFile.length > 0 ? uploadedFile : [];

  // Gestion sélection piste pour affichage image + titre
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(null);

  // État pour l'aperçu temporaire de l'image avant upload
  const [tempImagePreview, setTempImagePreview] = useState(null);

  // Formatage temps en mm:ss
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- effet principal : mise à jour de la source audio quand currentTrack change ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      // stop & cleanup
      try { audio.pause(); } catch (e) { }
      audio.src = '';
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
        lastBlobUrlRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Mise à jour source audio (blob ou url distante)
    if (currentTrack.isLocalPreview && currentTrack.audioFile) {
      const blobUrl = URL.createObjectURL(currentTrack.audioFile);

      // revoke previous blob si existant
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }

      audio.src = blobUrl;
      lastBlobUrlRef.current = blobUrl;
    } else if (currentTrack.src) {
      // piste distante
      audio.src = currentTrack.src;

      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
        lastBlobUrlRef.current = null;
      }
    } else {
      audio.src = '';
      setIsPlaying(false);
      return;
    }

    audio.load();
    setAudioError(null);

    return () => {
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
        lastBlobUrlRef.current = null;
      }
    };
  }, [currentTrack]);

  // --- Gestion erreurs audio avec délai (évite d'afficher un message au chargement) ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let errorTimeout = null;
    const handleError = () => {
      if (!currentTrack || !audio.src) return;

      errorTimeout = setTimeout(() => {
        let errorMessage = 'Erreur audio inconnue';
        if (audio.error) {
          switch (audio.error.code) {
            case audio.error.MEDIA_ERR_ABORTED:
              errorMessage = 'Lecture interrompue';
              break;
            case audio.error.MEDIA_ERR_NETWORK:
              errorMessage = 'Erreur réseau';
              break;
            case audio.error.MEDIA_ERR_DECODE:
              errorMessage = 'Erreur décodage audio';
              break;
            case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Format audio non supporté ou fichier inaccessible';
              break;
            default:
              errorMessage = `Erreur audio (code: ${audio.error.code})`;
          }
        }
        setAudioError(errorMessage);
        setIsPlaying(false);
        if (typeof setPlayingPlayerId === 'function') setPlayingPlayerId(null);
      }, 500);
    };

    audio.addEventListener('error', handleError);
    return () => {
      audio.removeEventListener('error', handleError);
      if (errorTimeout) clearTimeout(errorTimeout);
      setAudioError(null);
    };
  }, [currentTrack, isPlaying, setPlayingPlayerId]);

  // --- Mise à jour barre progression pendant lecture ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const current = audio.currentTime;
        setCurrentTime(current);
        setProgress((current / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [currentTrack]);

  // --- Sync lecture/pause si un autre player joue (ou si parent change playingPlayerId) ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingPlayerId !== id) {
      // si ce player n'est pas le player courant, on pause
      if (isPlaying) {
        try { audio.pause(); } catch (e) { }
        setIsPlaying(false);
      }
    }
  }, [playingPlayerId, id, isPlaying]);

  // --- Sync sélection piste à nouvelle playlist ---
  useEffect(() => {
    if (playlist.length === 0) {
      setCurrentTrack(null);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setSelectedTrackIndex(null);
      return;
    }

    const validIndex = playlist.findIndex(t => (t.isLocalPreview && t.audioFile) || t.src);

    if (validIndex === -1) {
      setCurrentTrack(null);
      setSelectedTrackIndex(null);
      setCurrentTrackIndex(0);
      return;
    }

    const currentIndexInPlaylist = playlist.findIndex(t => t.title === currentTrack?.title);
    if (currentIndexInPlaylist === -1 || !((playlist[currentIndexInPlaylist].isLocalPreview && playlist[currentIndexInPlaylist].audioFile) || playlist[currentIndexInPlaylist].src)) {
      // lance la première piste valide (mais sans forcer play si autoplay bloqué)
      setCurrentTrack(playlist[validIndex]);
      setCurrentTrackIndex(validIndex);
      setSelectedTrackIndex(validIndex);
    } else {
      setSelectedTrackIndex(currentIndexInPlaylist);
      setCurrentTrackIndex(currentIndexInPlaylist);
    }
  }, [playlist]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nettoyer l'aperçu temporaire quand on change de piste sélectionnée
  useEffect(() => {
    // On nettoie l'aperçu temporaire seulement quand on change de piste
    if (tempImagePreview) {
      URL.revokeObjectURL(tempImagePreview);
      setTempImagePreview(null);
    }
  }, [selectedTrackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Prev / Next (cherche la piste suivante/précédente valide) ---
  const handlePrev = () => {
    if (playlist.length === 0) return;

    let newIndex = currentTrackIndex;
    for (let i = 1; i <= playlist.length; i++) {
      const tryIndex = (currentTrackIndex - i + playlist.length) % playlist.length;
      const track = playlist[tryIndex];
      if ((track.isLocalPreview && track.audioFile) || track.src) {
        newIndex = tryIndex;
        break;
      }
    }
    setCurrentTrackIndex(newIndex);
    setSelectedTrackIndex(newIndex);
    setCurrentTrack(playlist[newIndex]);
    setAnimationKey(k => k + 1);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;

    let newIndex = currentTrackIndex;
    for (let i = 1; i <= playlist.length; i++) {
      const tryIndex = (currentTrackIndex + i) % playlist.length;
      const track = playlist[tryIndex];
      if ((track.isLocalPreview && track.audioFile) || track.src) {
        newIndex = tryIndex;
        break;
      }
    }
    setCurrentTrackIndex(newIndex);
    setSelectedTrackIndex(newIndex);
    setCurrentTrack(playlist[newIndex]);
    setAnimationKey(k => k + 1);
  };

  // --- Clic sur une piste de la liste (play/pause toggle) ---
  const handleTrackClick = (track, index = null) => {
    if (!track) return;

    setAudioError(null);

    // si la même piste et déjà en lecture -> pause
    if (currentTrack?.title === track.title && isPlaying) {
      try { audioRef.current.pause(); } catch (e) { }
      setIsPlaying(false);
      if (typeof setPlayingPlayerId === 'function') setPlayingPlayerId(null);
    } else {
      // sinon on change la piste et on tente de jouer
      setCurrentTrack(track);
      if (index !== null) {
        setCurrentTrackIndex(index);
        setSelectedTrackIndex(index);
      }
      setAnimationKey(k => k + 1);

      // Attendre que l'audio soit chargé puis jouer
      setTimeout(() => {
        if (audioRef.current && audioRef.current.src) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            if (typeof setPlayingPlayerId === 'function') setPlayingPlayerId(id);
            if (typeof setActivePlayerId === 'function') setActivePlayerId(id);
          }).catch(err => {
            // Ne pas afficher d'erreur si c'est juste un problème d'autoplay
            if (!err.message.includes('user didn\'t interact')) {
              setAudioError(`Erreur lecture: ${err?.message || err}`);
            }
            setIsPlaying(false);
          });
        }
      }, 100);
    }
  };

  // --- Bouton play/pause principal (icône) ---
  const handlePlayButton = () => {
    setAudioError(null);

    if (currentTrack) {
      // si on a déjà une piste sélectionnée, on toggle lecture
      if (isPlaying) {
        try { audioRef.current.pause(); } catch (e) { }
        setIsPlaying(false);
        if (typeof setPlayingPlayerId === 'function') setPlayingPlayerId(null);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          if (typeof setPlayingPlayerId === 'function') setPlayingPlayerId(id);
          if (typeof setActivePlayerId === 'function') setActivePlayerId(id);
        }).catch(err => {
          setAudioError(`Erreur lecture: ${err?.message || err}`);
          setIsPlaying(false);
        });
      }
    } else if (playlist.length > 0) {
      // pas de piste sélectionnée -> démarre la première
      handleTrackClick(playlist[0], 0);
    }
  };

  // --- Gestion clic / drag barre progression ---
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

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const audio = audioRef.current;
    if (!audio || isNaN(audio.duration)) return;

    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const width = rect.width;

    const newTime = Math.max(0, Math.min(1, moveX / width)) * audio.duration;
    audio.currentTime = newTime;
    setProgress((moveX / width) * 100);
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = () => setIsDragging(true);
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const audio = audioRef.current;
    if (!audio || isNaN(audio.duration)) return;

    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const width = rect.width;

    const newTime = Math.max(0, Math.min(1, touchX / width)) * audio.duration;
    audio.currentTime = newTime;
    setProgress((touchX / width) * 100);
  };
  const handleTouchEnd = () => setIsDragging(false);

  // --- Upload image pour photo piste sélectionnée ---
  const handleImageUpload = async (e) => {
    if (selectedTrackIndex === null) return;
    const file = e.target.files[0];
    if (!file) return;

    const selectedTrack = playlist[selectedTrackIndex];
    if (!selectedTrack) return;

    // Créer un aperçu temporaire immédiatement
    const tempUrl = URL.createObjectURL(file);
    setTempImagePreview(tempUrl);

    try {
      // Si c'est une preview locale, on utilise onUpdatePreviewImage
      if (selectedTrack.isLocalPreview && onUpdatePreviewImage) {
        onUpdatePreviewImage(selectedTrack.title, file);
      }
      // Si c'est une piste déjà uploadée, on utilise onUpdateTrackImage
      else if (!selectedTrack.isLocalPreview && onUpdateTrackImage) {
        await onUpdateTrackImage(selectedTrack.title, file);
        // Pour les pistes uploadées, on nettoie seulement après un délai
        setTimeout(() => {
          URL.revokeObjectURL(tempUrl);
          setTempImagePreview(null);
        }, 1000);
      }
    } catch (err) {
      // En cas d'erreur, on garde l'aperçu temporaire
      alert('Erreur upload image: ' + err.message);
    }
  };

  // URL image à afficher : priorité à l'aperçu temporaire, sinon l'image de la piste
  const displayedImageUrl = (() => {
    // Si on a un aperçu temporaire, on l'affiche en priorité
    if (tempImagePreview) return tempImagePreview;

    if (selectedTrackIndex === null) return null;
    const track = playlist[selectedTrackIndex];
    if (!track) return null;
    return track.imgSrc || null;
  })();

  // --- Rendue JSX (images utilisent chemins absolus depuis /public) ---
  return (
    <div className='music-player-container' ref={ref}>
      <audio ref={audioRef} preload='metadata' crossOrigin="anonymous" />
      <div className={`music-player-contain ${themeColor}`}>
        {audioError && (
          <div style={{
            background: '#ff4444',
            color: 'white',
            padding: '5px',
            fontSize: '12px',
            marginBottom: '10px'
          }}>
            ⚠️ {audioError}
          </div>
        )}

        <div className='music-player-top'>
          <div className='music-player-picture-container'>
            <div
              className='music-player-picture'
              style={{
                backgroundImage: displayedImageUrl ? `url(${displayedImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {selectedTrackIndex !== null && !hideImageInput && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ marginTop: '10px' }}
                aria-label="Uploader une image pour la piste sélectionnée"
              />
            )}
          </div>

          <div className='music-player-artist-container'>
            <div className='music-player-artist-title'>
              {playlist[selectedTrackIndex]?.artist || currentTrack?.artist || ''}
            </div>
            <div className='music-player-track-title'>
              <span key={animationKey} className="scrolling-text">
                {playlist[selectedTrackIndex]?.title || currentTrack?.title || ''}
              </span>
            </div>
          </div>
        </div>

        <div className='music-player-controls'>
          <div className='music-player-timeline-duration'>
            <div
              className='music-player-timeline'
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
            {/* chemins absolus vers public/ */}
            <img src="/prev.png" alt="Précédent" onClick={handlePrev} style={{ cursor: 'pointer' }} />
            <img
              src={isPlaying ? "/pause.png" : "/play.png"}
              alt="Lecture/Pause"
              onClick={handlePlayButton}
              style={{ cursor: 'pointer' }}
            />
            <img src="/next.png" alt="Suivant" onClick={handleNext} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div className='music-player-bottom'>
          {playlist.map((track, index) => (
            <div
              key={`${track.title}-${index}`}
              className={`music-player-artist-list-container ${selectedTrackIndex === index ? 'selected' : ''} ${track.isLocalPreview ? 'preview-track' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer',
                opacity: track.isLocalPreview ? 0.7 : 1,
                fontStyle: track.isLocalPreview ? 'italic' : 'normal'
              }}
              onClick={() => {
                setSelectedTrackIndex(index);
                handleTrackClick(track, index);
              }}
              title={`${track.title}${track.isLocalPreview ? ' (En attente)' : ''}`}
            >
              <div className='music-player-title-list'>
                {track.title} {track.isLocalPreview && '(En attente)'}
              </div>

              {onRemoveTrack && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTrack(track);
                    if (selectedTrackIndex === index) setSelectedTrackIndex(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: track.isLocalPreview ? '#ffa500' : 'red',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginLeft: '10px',
                  }}
                  title={`Supprimer ${track.title}`}
                  aria-label={`Supprimer ${track.title}`}
                >
                  ✖
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default MusicPlayer;