import './JukeboxAdd.scss';
import MusicPlayer from './MusicPlayer';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JukeboxAdd = () => {
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [playingPlayerId, setPlayingPlayerId] = useState(null);

  // fichiers déjà uploadés (URLs distantes)
  const [uploadedFiles, setUploadedFiles] = useState([[], [], []]);

  // fichiers en attente d'upload (avec blob URLs de preview)
  const [filesToUploadByPlayer, setFilesToUploadByPlayer] = useState([[], [], []]);

  // refs pour inputs audio cachés pour chaque player
  const audioFileInputs = [useRef(null), useRef(null), useRef(null)];

  // refs aux players
  const playerRefs = [useRef(null), useRef(null), useRef(null)];

  // Modal état
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // État de chargement pour éviter les requêtes multiples
  const [isUploading, setIsUploading] = useState([false, false, false]);

  const navigate = useNavigate();

  // --- Déconnexion ---
  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } catch (_) { }
    navigate('/admin/');
  };

  // Chargement des données depuis le serveur au montage du composant
  useEffect(() => {
    const loadTracksForAllPlayers = async () => {
      try {
        for (let i = 0; i < 3; i++) {
          const lecteurName = `lecteur${i + 1}`;
          const response = await fetch(`/api/tracks?lecteur=${lecteurName}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.tracks && data.tracks.length > 0) {
              // Convertir le format de stockage vers le format attendu par MusicPlayer
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
          } else {
            console.warn(`Erreur chargement lecteur ${i + 1}:`, response.status);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des pistes:', err);
      }
    };

    loadTracksForAllPlayers();
  }, []);

  // Nettoyage blobs URLs uniquement à la destruction du composant
  useEffect(() => {
    return () => {
      filesToUploadByPlayer.forEach(files => {
        files.forEach(pair => {
          if (pair.audioPreviewUrl) URL.revokeObjectURL(pair.audioPreviewUrl);
          if (pair.imgPreviewUrl) URL.revokeObjectURL(pair.imgPreviewUrl);
        });
      });
    };
  }, [filesToUploadByPlayer]);

  // Ajout fichiers audio sélectionnés, création preview blobs
  const handleAudioSelection = (playerIndex, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log(`Sélection de ${files.length} fichier(s) pour lecteur ${playerIndex + 1}`);

    const newPairs = files.map(file => ({
      audioFile: file,
      imgFile: null,
      audioPreviewUrl: URL.createObjectURL(file),
      imgPreviewUrl: null,
    }));

    setFilesToUploadByPlayer(prev => {
      const updated = [...prev];
      // Ajouter les nouveaux fichiers aux fichiers existants (accumulation)
      updated[playerIndex] = [...updated[playerIndex], ...newPairs];
      console.log(`Total fichiers en attente pour lecteur ${playerIndex + 1}:`, updated[playerIndex].length);
      return updated;
    });
  };

  // Mise à jour de l'image d'une preview
  const updatePreviewImage = (playerIndex, pendingIndex, imageFile) => {
    setFilesToUploadByPlayer(prev => {
      const updated = [...prev];
      if (!updated[playerIndex] || !updated[playerIndex][pendingIndex]) {
        console.error('Preview non trouvée:', playerIndex, pendingIndex);
        return prev;
      }

      const targetPair = { ...updated[playerIndex][pendingIndex] };

      // revoke ancienne image preview si existante
      if (targetPair.imgPreviewUrl) {
        URL.revokeObjectURL(targetPair.imgPreviewUrl);
      }

      targetPair.imgFile = imageFile;
      targetPair.imgPreviewUrl = URL.createObjectURL(imageFile);

      updated[playerIndex][pendingIndex] = targetPair;
      return updated;
    });
  };

  // Ouvrir dialogue sélection audio
  const handleAudioButtonClick = (playerIndex) => {
    if (isUploading[playerIndex]) return; // Empêcher ajout pendant upload
    
    const input = audioFileInputs[playerIndex]?.current;
    if (!input) return;
    input.value = '';
    input.click();
  };

  // Upload fichiers audio+image vers serveur - VERSION CORRIGÉE
  const uploadFiles = async (playerIndex) => {
    if (filesToUploadByPlayer[playerIndex].length === 0) return;
    if (isUploading[playerIndex]) return; // Empêcher uploads multiples

    // Marquer comme en cours d'upload
    setIsUploading(prev => {
      const updated = [...prev];
      updated[playerIndex] = true;
      return updated;
    });

    const lecteurName = `lecteur${playerIndex + 1}`;
    const newTracks = [];
    let successCount = 0;

    try {
      console.log(`Début upload de ${filesToUploadByPlayer[playerIndex].length} fichier(s) pour ${lecteurName}`);

      for (const [index, pair] of filesToUploadByPlayer[playerIndex].entries()) {
        if (!pair.audioFile) continue;

        try {
          console.log(`Upload ${index + 1}/${filesToUploadByPlayer[playerIndex].length}: ${pair.audioFile.name}`);

          // URL upload audio avec timeout plus long
          const audioParams = new URLSearchParams({
            lecteur: lecteurName,
            filename: pair.audioFile.name,
            type: 'audio',
            contentType: pair.audioFile.type || 'audio/mpeg',
          });

          const audioRes = await fetch(`/api/upload-url?${audioParams.toString()}`, {
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!audioRes.ok) {
            const errorText = await audioRes.text();
            throw new Error(`Erreur récupération URL audio (${audioRes.status}): ${errorText}`);
          }

          const { uploadUrl: audioUploadUrl, fileUrl: audioFileUrl } = await audioRes.json();

          // Upload audio avec timeout personnalisé
          const audioUploadRes = await fetch(audioUploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': pair.audioFile.type || 'audio/mpeg' },
            body: pair.audioFile,
          });

          if (!audioUploadRes.ok) {
            throw new Error(`Erreur upload audio (${audioUploadRes.status}): ${audioUploadRes.statusText}`);
          }

          // Upload image si présente
          let imgFileUrl = null;
          if (pair.imgFile) {
            try {
              const imgParams = new URLSearchParams({
                lecteur: lecteurName,
                filename: pair.imgFile.name,
                type: 'image',
                contentType: pair.imgFile.type || 'image/jpeg',
              });

              const imgRes = await fetch(`/api/upload-url?${imgParams.toString()}`, {
                headers: { 'Content-Type': 'application/json' },
              });

              if (imgRes.ok) {
                const { uploadUrl: imgUploadUrl, fileUrl: imageFileUrl } = await imgRes.json();

                const imgUploadRes = await fetch(imgUploadUrl, {
                  method: 'PUT',
                  headers: { 'Content-Type': pair.imgFile.type || 'image/jpeg' },
                  body: pair.imgFile,
                });

                if (imgUploadRes.ok) {
                  imgFileUrl = imageFileUrl;
                } else {
                  console.warn('Erreur upload image, continuons sans image');
                }
              }
            } catch (imgErr) {
              console.warn('Erreur image:', imgErr.message);
            }
          }

          // Créer l'objet track pour la sauvegarde
          newTracks.push({
            audio: audioFileUrl,
            title: pair.audioFile.name,
            artist: '',
            type: pair.audioFile.type || 'audio/mpeg',
            image: imgFileUrl,
            uploadedAt: new Date().toISOString(),
          });

          // Revoke blob URLs uniquement après upload réussi
          if (pair.audioPreviewUrl) URL.revokeObjectURL(pair.audioPreviewUrl);
          if (pair.imgPreviewUrl) URL.revokeObjectURL(pair.imgPreviewUrl);

          successCount++;

        } catch (fileErr) {
          console.error(`Erreur upload ${pair.audioFile.name}:`, fileErr);
          // Continue avec les autres fichiers même si un échoue
        }
      }

      if (newTracks.length === 0) {
        throw new Error('Aucun fichier n\'a pu être uploadé');
      }

      // Sauvegarder les nouvelles pistes dans tracks.json - APPEND MODE
      const saveRes = await fetch('/api/tracks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecteur: lecteurName,
          tracks: newTracks,
          replace: false // Mode ajout, pas remplacement
        }),
      });

      if (!saveRes.ok) {
        const errorText = await saveRes.text();
        throw new Error(`Erreur sauvegarde tracks.json (${saveRes.status}): ${errorText}`);
      }

      // Mettre à jour l'état local avec les nouvelles pistes
      const formattedNewFiles = newTracks.map(track => ({
        src: track.audio,
        title: track.title,
        artist: track.artist || '',
        type: track.type,
        imgSrc: track.image,
      }));

      setUploadedFiles(prev => {
        const updated = [...prev];
        updated[playerIndex] = [...(updated[playerIndex] || []), ...formattedNewFiles];
        return updated;
      });

      // Vider la liste des fichiers en attente
      setFilesToUploadByPlayer(prev => {
        const updated = [...prev];
        updated[playerIndex] = [];
        return updated;
      });

      // Afficher modal succès
      const message = successCount === filesToUploadByPlayer[playerIndex].length 
        ? `${successCount} fichier(s) uploadé(s) avec succès pour Lecteur ${playerIndex + 1} !`
        : `${successCount}/${filesToUploadByPlayer[playerIndex].length} fichier(s) uploadé(s) pour Lecteur ${playerIndex + 1}`;
      
      setModalMessage(message);
      setShowModal(true);
      
    } catch (err) {
      console.error('Erreur upload complète:', err);
      alert(`Erreur upload : ${err.message}`);
    } finally {
      // Retirer le flag d'upload
      setIsUploading(prev => {
        const updated = [...prev];
        updated[playerIndex] = false;
        return updated;
      });
    }
  };

  // Supprimer un fichier en attente (preview)
  const removePendingFile = (playerIndex, trackTitle) => {
    setFilesToUploadByPlayer(prev => {
      const updated = [...prev];
      const index = updated[playerIndex].findIndex(pair => pair.audioFile.name === trackTitle);

      if (index !== -1) {
        const pair = updated[playerIndex][index];
        console.log(`Suppression preview: ${trackTitle}`);
        
        // Nettoyer les URLs blob
        if (pair.audioPreviewUrl) URL.revokeObjectURL(pair.audioPreviewUrl);
        if (pair.imgPreviewUrl) URL.revokeObjectURL(pair.imgPreviewUrl);
        
        // Retirer de la liste
        updated[playerIndex] = updated[playerIndex].filter((_, i) => i !== index);
      }

      return updated;
    });
  };

// Supprimer une piste uploadée sans supprimer toutes les autres
const removeUploadedTrack = async (playerIndex, trackTitle) => {
  try {
    const lecteurName = `lecteur${playerIndex + 1}`;
    const trackToRemove = uploadedFiles[playerIndex].find(track => track.title === trackTitle);

    if (!trackToRemove) return;

    console.log(`Suppression piste uploadée: ${trackToRemove.title} (${trackToRemove.src})`);

    // Suppression côté serveur
    const deletePromises = [];
    if (trackToRemove.src) {
      deletePromises.push(fetch('/api/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: trackToRemove.src, lecteur: lecteurName }),
      }));
    }
    if (trackToRemove.imgSrc) {
      deletePromises.push(fetch('/api/delete-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: trackToRemove.imgSrc, lecteur: lecteurName }),
      }));
    }
    await Promise.all(deletePromises);

    // ⚠️ Filtrer uniquement sur la clé unique `src`
    const updatedTracks = uploadedFiles[playerIndex].filter(track => track.src !== trackToRemove.src);

    if (updatedTracks.length === 0) {
      await fetch(`/api/tracks?lecteur=${lecteurName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      setUploadedFiles(prev => {
        const updated = [...prev];
        updated[playerIndex] = [];
        return updated;
      });

      setModalMessage(`"${trackToRemove.title}" supprimé. Le lecteur ${playerIndex + 1} est maintenant vide.`);
      setShowModal(true);
      return;
    }

    // Sauvegarder la liste mise à jour
    const tracksToSave = updatedTracks.map(track => ({
      audio: track.src,
      title: track.title,
      artist: track.artist || '',
      type: track.type || 'audio/mpeg',
      image: track.imgSrc || null,
      uploadedAt: new Date().toISOString(),
    }));

    const saveRes = await fetch('/api/tracks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lecteur: lecteurName,
        tracks: tracksToSave,
        replace: true
      }),
    });

    if (!saveRes.ok) throw new Error('Erreur mise à jour tracks.json');

    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[playerIndex] = updatedTracks;
      return updated;
    });

    setModalMessage(`"${trackToRemove.title}" supprimé avec succès`);
    setShowModal(true);

  } catch (err) {
    console.error('Erreur suppression complète:', err);
    alert(`Erreur suppression piste : ${err.message}`);
  }
};

  // Fonction pour mettre à jour l'image d'une piste existante
  const updateTrackImage = async (playerIndex, trackTitle, imageFile) => {
    try {
      const lecteurName = `lecteur${playerIndex + 1}`;
      const trackIndex = uploadedFiles[playerIndex].findIndex(t => t.title === trackTitle);

      if (trackIndex === -1) throw new Error('Piste non trouvée');

      console.log(`Mise à jour image pour: ${trackTitle}`);

      // Upload de la nouvelle image
      const imgParams = new URLSearchParams({
        lecteur: lecteurName,
        filename: imageFile.name,
        type: 'image',
        contentType: imageFile.type,
      });

      const imgRes = await fetch(`/api/upload-url?${imgParams.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!imgRes.ok) throw new Error('Erreur récupération URL image');

      const { uploadUrl, fileUrl } = await imgRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile,
      });

      if (!uploadRes.ok) throw new Error('Erreur upload image');

      // Supprimer l'ancienne image si elle existe
      const oldTrack = uploadedFiles[playerIndex][trackIndex];
      if (oldTrack.imgSrc) {
        try {
          await fetch('/api/delete-file', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileUrl: oldTrack.imgSrc,
              lecteur: lecteurName,
            }),
          });
        } catch (err) {
          console.error('Erreur suppression ancienne image:', err);
        }
      }

      // Mettre à jour la piste avec la nouvelle image
      const updatedTracks = [...uploadedFiles[playerIndex]];
      updatedTracks[trackIndex] = {
        ...updatedTracks[trackIndex],
        imgSrc: fileUrl,
      };

      // Sauvegarder sur le serveur
      const tracksToSave = updatedTracks.map(t => ({
        audio: t.src,
        title: t.title,
        artist: t.artist || '',
        type: t.type || 'audio/mpeg',
        image: t.imgSrc || null,
        uploadedAt: new Date().toISOString(),
      }));

      const saveRes = await fetch('/api/tracks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecteur: lecteurName,
          tracks: tracksToSave,
          replace: true  // Remplacer complètement pour éviter les incohérences
        }),
      });

      if (!saveRes.ok) throw new Error('Erreur sauvegarde tracks.json');

      // Mettre à jour l'état local
      setUploadedFiles(prev => {
        const updated = [...prev];
        updated[playerIndex] = updatedTracks;
        return updated;
      });

      setModalMessage(`Image mise à jour pour "${trackTitle}"`);
      setShowModal(true);
    } catch (err) {
      console.error('Erreur mise à jour image complète:', err);
      alert(`Erreur mise à jour image : ${err.message}`);
    }
  };

  return (
    <div className='jukebox-add-container'>
      <div className='jukebox-add-header'>
        <div className='jukebox-add-main'>
          <div className='jukebox-add-titles'>
            <div className='jukebox-add-title'>
              <h1>Bienvenue Ben</h1>
            </div>
            <div className='jukebox-add-title-line'></div>
            <button onClick={handleLogout} className='logout-button'>Déconnexion</button>
          </div>

          <div className='jukebox-add-carousel'>
            <div className='jukebox-add-players'>
              {[1, 2, 3].map((id, playerIndex) => {
                // Combine uploaded + local previews
                const previewFiles = [
                  ...(uploadedFiles[playerIndex] || []),
                  ...filesToUploadByPlayer[playerIndex].map(pair => ({
                    src: pair.audioPreviewUrl || null,
                    title: pair.audioFile.name,
                    artist: '',
                    type: pair.audioFile.type || 'audio/mpeg',
                    isLocalPreview: true,
                    imgSrc: pair.imgPreviewUrl || null,
                    audioFile: pair.audioFile,
                  })),
                ];

                return (
                  <div className={`music-player-${id}`} key={id}>
                    <div className={`music-player-title-${id}`}>
                      <h4>
                        Lecteur {id} 
                        {isUploading[playerIndex] && ' (Upload en cours...)'}
                        {filesToUploadByPlayer[playerIndex].length > 0 && 
                          ` (${filesToUploadByPlayer[playerIndex].length} en attente)`
                        }
                      </h4>
                    </div>

                    <MusicPlayer
                      themeColor={id === 1 ? 'white' : id === 2 ? 'turquoise' : 'orange'}
                      id={id}
                      activePlayerId={activePlayerId}
                      setActivePlayerId={setActivePlayerId}
                      playingPlayerId={playingPlayerId}
                      setPlayingPlayerId={setPlayingPlayerId}
                      ref={playerRefs[playerIndex]}
                      uploadedFile={previewFiles}
                      playerIndex={playerIndex}
                      onRemoveTrack={(track) => {
                        if (track?.isLocalPreview) {
                          removePendingFile(playerIndex, track.title);
                        } else {
                          removeUploadedTrack(playerIndex, track.title);
                        }
                      }}
                      onUpdateTrackImage={(trackTitle, imageFile) => {
                        updateTrackImage(playerIndex, trackTitle, imageFile);
                      }}
                      onUpdatePreviewImage={(trackTitle, imageFile) => {
                        // Trouver le bon index basé sur le titre
                        const pairIndex = filesToUploadByPlayer[playerIndex].findIndex(
                          pair => pair.audioFile.name === trackTitle
                        );
                        if (pairIndex !== -1) {
                          updatePreviewImage(playerIndex, pairIndex, imageFile);
                        }
                      }}
                    />

                    <div className={`jukebox-add-button-${id}`}>
                      {/* Input audio caché */}
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        ref={audioFileInputs[playerIndex]}
                        style={{ display: 'none' }}
                        onChange={(e) => handleAudioSelection(playerIndex, e)}
                      />
                      <button 
                        onClick={() => handleAudioButtonClick(playerIndex)}
                        disabled={isUploading[playerIndex]}
                      >
                        {isUploading[playerIndex] ? 'Upload en cours...' : 'Ajouter un ou plusieurs fichiers audio'}
                      </button>

                      <button
                        disabled={filesToUploadByPlayer[playerIndex].length === 0 || isUploading[playerIndex]}
                        onClick={() => uploadFiles(playerIndex)}
                      >
                        {isUploading[playerIndex] 
                          ? 'Upload en cours...' 
                          : `Confirmer l'envoi${filesToUploadByPlayer[playerIndex].length > 0 ? ` (${filesToUploadByPlayer[playerIndex].length})` : ''}`
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JukeboxAdd;