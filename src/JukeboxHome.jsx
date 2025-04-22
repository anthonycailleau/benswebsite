import './JukeboxHome.scss';

const JukeboxHome = () => {
    return (
        <div className='jukebox-home-container'>
            <div className='jukebox-home-header'>
                <div className='jukebox-home-picture'>
                    <img src="jukebox_carré.png" alt="photo de Ben Bridgen écoutant de la musique" />
                </div>
                <div className='jukebox-home-main'>
                    <div className='jukebox-home-titles'>
                        <div className='jukebox-home-title'>
                            <h1> Jukebox </h1>
                        </div>
                        <div className='jukebox-home-title-line'></div>
                    </div>
                    <div className='jukebox-home-user-titles'>
                        <div className='jukebox-home-user-title'>
                            <h4>Administrateur</h4>
                        </div>
                        <div className='jukebox-home-line'></div>
                    </div>
                    <div className='jukebox-home-contact-content'>
                        <div className='jukebox-home-contact-form'>
                            <form action="">
                                <div>
                                    <label htmlFor="email"> Email </label>
                                    <input type="text" id="email" name="email" placeholder="email" />
                                </div>
                                <div>
                                    <label htmlFor="password"> Mot de Passe</label>
                                    <input type="password" id="password" name="password" placeholder="mot de passe" />
                                </div>
                            </form>
                        </div>
                        <button className='jukebox-home-button' type="submit"> Connexion </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JukeboxHome;