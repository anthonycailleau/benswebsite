import './JukeboxAdd.scss';

const JukeboxAdd = () => {
    return (
        <div className='jukebox-add-container'>
            <div className='jukebox-add-header'>
                <div className='jukebox-add-picture'>
                    <img src="jukebox_carré.png" alt="photo de Ben Bridgen écoutant de la musique" />
                </div>
                <div className='jukebox-add-main'>
                    <div className='jukebox-add-titles'>
                        <div className='jukebox-add-title'>
                            <h1> Bienvenue Ben </h1>
                        </div>
                        <div className='jukebox-add-title-line'></div>
                    </div>
                    <div className='jukebox-add-user-titles'>
                        <div className='jukebox-add-user-title'>
                            <h4>Premier Lecteur</h4>
                        </div>
                        <div className='jukebox-add-line'></div>
                    </div>
                    <div className='jukebox-add-download-container'>
                        <div className='jukebox-add-download-title'>
                            <h5> Télécharger un fichier</h5>
                        </div>
                        <button className='jukebox-add-button'> Ajouter un fichier </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JukeboxAdd;