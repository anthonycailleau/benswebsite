import './Studio.scss';

const Studio = () => {
    return (
        <div className='studio-container'>
            <div className='studio-header'>
                <div className='studio-header-mobile-landscape'>
                    <div className='studio-picture'>
                        <img src="studio_carré.png" alt="photo de Ben Bridgen de profil" />
                    </div>
                    <div className='studio-titles'>
                        <div className='studio-title'>
                            <h1>le studio</h1>
                        </div>
                        <div className='studio-line'></div>
                        <div className='studio-title-description'>
                            <h5>Cliquez ici pour la version anglaise</h5>
                            <img src="english-logo.png" alt="" />
                        </div>
                    </div>
                </div>
                <div className='studio-caroussel-container'>
                    <div className='studio-caroussel'>
                        <img src="caroussel_1.jpg" alt="" />
                    </div>
                </div>
            </div>
            <div className='studio-main'>
                <div className='studio-paragraph'>
                    <p>
                        Le studio d’enregistrement [Nom du studio], fondé par Ben Bridgen, est un espace dédié à la création musicale et à la production sonore. Équipé de matériel haut de gamme et d’une acoustique optimisée, il accueille artistes et producteurs pour l’enregistrement, le mixage et le mastering de leurs projets. Son ambiance chaleureuse et son expertise technique en font un lieu incontournable pour donner vie aux idées musicales.
                    </p>
                </div>
            </div>
        </div>

    );
};

export default Studio; 