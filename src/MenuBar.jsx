import './MenuBar.scss';

const MenuBar = () => {
    return (
        <div className='menu-bar-container'>
            <div className='menu-bar-tabs'>
                <button role='tab' aria-selected='false' aria-controls='section-about' id='tab-home'>Accueil</button>
                <button role='tab' aria-selected='false' aria-controls='section-bio' id='tab-bio'>Bio</button>
                <button role='tab' aria-selected='false' aria-controls='section-music' id='tab-music'>Musique</button>
                <button role='tab' aria-selected='false' aria-controls='section-studio' id='tab-studio'>Studio</button>
                <button role='tab' aria-selected='false' aria-controls='section-contact' id='tab-contact'>Contact</button>
                <div className='logo-translate'>
                    <img src="french-logo.png" alt="logo de traduction français-anglais" />
                </div>
            </div>
            <div className='menu-bar-line'></div>
        </div>
    );
};
export default MenuBar; 