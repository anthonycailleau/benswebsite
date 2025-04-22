import MenuBar from './MenuBar';
import Home from './Home';
import Bio from './Bio';
import Music from './Music';
import Studio from './Studio';
import Contact from './Contact';
import JukeboxHome from './JukeboxHome';
import JukeboxPlayer from './JukeboxPlayer';
import JukeboxAdd from './JukeboxAdd';
import './styles/main.scss';
import './App.scss';



const App = () => {
  return (
    <div className='app-container'>
      <MenuBar />
      <Home />
      <Bio />
      <Music />
      <Studio />
      <Contact />
      {/* <JukeboxHome />
      <JukeboxPlayer />
      <JukeboxAdd /> */}
    </div>
  );
};

export default App; 