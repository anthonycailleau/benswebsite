import './Bio.scss';

const Bio = () => {
    return (
        <section>
            <div className='bio-container'>
                <div className='bio-header'>
                    <div className='bio-header-mobile-landscape'>
                        <div className='bio-picture'>
                            <img src="bio1_carré.png" alt="photo de Ben Bridgen souriant" />
                        </div>
                        <div className='bio-titles'>
                            <div className='bio-title'>
                                <h1>bio</h1>
                            </div>
                            <div className='bio-line'></div>
                            <div className='bio-title-description'>
                                <h5>Cliquez ici pour la version anglaise</h5>
                                <img src="english-logo.png" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className='bio-video-container'>
                        <video controls width="100%" poster="/bio-cover.png">
                            <source src="https://www.dropbox.com/scl/fi/e18ww9z5mw14rgdrfu00v/Partition-d-un-Reve-VF.mov?rlkey=b987olus6c9shxmlt1lxoytu1&raw=1" type="video/mp4" />
                            Votre navigateur ne supporte pas la lecture de vidéo.
                        </video>
                    </div>
                </div>
                <div className='bio-main'>

                    <div className='bio-paragraph'>
                        <p>
                            Ben Bridgen is a composer, a multi instrumentalist (piano, guitar. bass, percussion and vocals), an arranger and a sound engineer. An Englishman abroad, whose native culture influences his spontaneous. self-taught and creative way of making music, setting him apart from his French counterparts. He has produced more than 25 albums of original music, of which he is often the composer, or co-composer and arranger. His curiosity for new discoveries, and his love for music in all its forms mean that he doesn't place restrictions on styles or influences, so he has worked in genres as diverse as French pop music with a string quartet, West Indian dancehall, not to mention pop rock, Latin American music, hip-hop, Malagasy music, punk, rock. even "musette", traditional French accordion based songs. All of the above with great sensitivity, great passion, and very high standards.
                        </p>
                        <p>
                            He has also amassed considerable experience as a composer for multimedia, whether producing complete radio sound identities and jingles, music for television published by EMl, or collaborating on recording, advertising, and events. He has also done voice-over work for trailers and jingles, as well as occasionally singing for cartoons.
                            Since 2018 he has been working with the parisian music publisher Cézame on creating new music for their catalogue.
                        </p>
                        <p>
                            In 2022, Ben joined the contemporary dance company Le Collectif Mordu as resident composer and musician. Their first collaborative show
                            "La fable de l'autruche" is touring now, and there is a new production planned in 2024 which will involve music being created and performed live on stage.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Bio; 