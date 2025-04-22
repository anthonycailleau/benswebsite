import './Home.scss';

const Home = () => {
    return (
        <div className='home-container'>
                <div className='home-header'>
                    <div className='home-picture'>
                        <img src="home_carré.png" alt="photo de Ben Bridgen à l'air sérieux" />
                    </div>
                    <div className='home-titles'>
                        <div className='home-title'>
                            <h1>ben bridgen</h1>
                        </div>
                        <div className='home-line'></div>
                        <div className='home-title-description'>
                            <h3>musicien compositeur arrangeur</h3>
                        </div>
                    </div>
                </div>
            <div className='home-main'>
                <div className='home-paragraph'>
                    <p> Production et réalisation de musique, prise de son et mixage en studio d’enregistrement.</p>
                    <p> 25 ans d’expérience de création de disques de compositions originales,
                        de musique pour l’audio-visuel (TV, radio, voix off),
                        et de divers projets musicaux sur scène.</p>
                </div>
                <div className='home-footer'>
                    Photo d'Ernest Mandap
                </div>
            </div>


        </div>


    );
};

export default Home; 