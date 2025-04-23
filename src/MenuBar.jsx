import { Link } from 'react-scroll';
import './MenuBar.scss';

const MenuBar = () => {
  return (
    <div className='menu-bar-container'>
      <div className='menu-bar-tabs'>
        <Link to="home" smooth={true} duration={500}><button>Accueil</button></Link>
        <Link to="bio" smooth={true} duration={500}><button>Bio</button></Link>
        <Link to="music" smooth={true} duration={500}><button>Musique</button></Link>
        <Link to="studio" smooth={true} duration={500}><button>Studio</button></Link>
        <Link to="contact" smooth={true} duration={500}><button>Contact</button></Link>
        <div className='logo-translate'>
          <img src="french-logo.png" alt="logo de traduction français-anglais" />
        </div>
      </div>
      <div className='menu-bar-line'></div>
    </div>
  );
};

export default MenuBar;