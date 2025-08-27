import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PrivateRoute from './PrivateRoute';

import MenuBar from './MenuBar';
import Home from './Home';
import Bio from './Bio';
import Music from './Music';
import Studio from './Studio';
import Contact from './Contact';

// Composants du back-office
import JukeboxHome from './JukeboxHome';
import JukeboxAdd from './JukeboxAdd';
import JukeboxPlayer from './JukeboxPlayer';

import './styles/main.scss';
import './App.scss';

// Variantes d'animation
const pageVariant = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

const pageVariantProps = {
  variants: pageVariant,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: { duration: 0.3, ease: [0.4, 0, 0.4, 1] },
};

// Composant contenant les routes animées
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Routes publiques */}
        <Route
          path="/"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/bio"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <Bio />
            </motion.div>
          }
        />
        <Route
          path="/music"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <Music />
            </motion.div>
          }
        />
        <Route
          path="/studio"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <Studio />
            </motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <Contact />
            </motion.div>
          }
        />

        {/* Routes admin (back-office) */}
        <Route
          path="/admin"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <JukeboxHome />
            </motion.div>
          }
        />
        <Route
          path="/admin/add"
          element={
            <PrivateRoute>
              <motion.div className="page-wrapper" {...pageVariantProps}>
                <JukeboxAdd />
              </motion.div>
            </PrivateRoute>

          }
        />
        <Route
          path="/admin/player"
          element={
            <motion.div className="page-wrapper" {...pageVariantProps}>
              <JukeboxPlayer />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

// Composant principal
const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {/* Menu caché dans le back-office */}
      {!isAdminRoute && <MenuBar />}

      <div className="page-container">
        <AnimatedRoutes />
      </div>
    </div>
  );
};

export default App;