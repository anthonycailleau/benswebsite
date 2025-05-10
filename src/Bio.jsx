import { useState } from 'react';
import bioTexts from '../src/data/bioTexts';
import './Bio.scss';

const Bio = () => {
    const [lang, setLang] = useState('fr');
    const [fade, setFade] = useState(''); 

    const toggleLanguage = () => {
        setFade('fade-out'); 
        setTimeout(() => {
            setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
            setFade('fade-in'); 
        }, 250); 
        
    };
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
                            <div className='bio-title-description'
                                onClick={toggleLanguage}
                                style={{ cursor: 'pointer' }}
                            >
                                <h5>
                                    {lang === 'fr' ? 'Click here for English version' : 'Cliquez ici pour la version française'}
                                </h5>
                                <img src={lang === 'fr' ? 'english-logo.png' : 'french-logo.png'} alt="" />
                            </div>
                        </div>
                    </div>
                    <div className='bio-main'>
                        <div className={`bio-paragraph ${fade}`}>
                        {bioTexts[lang].map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                        </div>
                    </div>
                    <div className='bio-video-container'>
                        <video controls width="100%" poster='bio_play.png'>
                            <source src="https://www.dropbox.com/scl/fi/e18ww9z5mw14rgdrfu00v/Partition-d-un-Reve-VF.mov?rlkey=b987olus6c9shxmlt1lxoytu1&raw=1" type="video/mp4" />
                            Votre navigateur ne supporte pas la lecture de vidéo.
                        </video>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Bio; 