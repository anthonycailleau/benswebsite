
// Configuration centralisée pour les environnements
export const config = {
  // URLs API selon l'environnement
  api: {
    development: 'http://localhost:5001', // Port de votre serveur Express local
    production: 'https://benbridgen.com',
  },

  // Frontend URLs
  frontend: {
    development: 'http://localhost:3000',
    production: 'https://benbridgen.com',
  },

  // Configuration CORS autorisée
  corsOrigins: {
    development: ['http://localhost:3000', 'http://localhost:3001'],
    production: ['https://benbridgen.com', 'https://www.benbridgen.com'],
  }
};

// Helper pour obtenir la configuration actuelle
export const getCurrentEnv = () => {
  if (typeof window !== 'undefined') {
    // Côté client
    return window.location.hostname === 'localhost' ? 'development' : 'production';
  } else {
    // Côté serveur (Node.js)
    return process.env.NODE_ENV || 'development';
  }
};

// Helper pour obtenir l'URL API actuelle
export const getApiUrl = () => {
  const env = getCurrentEnv();
  return config.api[env];
};

// Helper pour obtenir l'URL frontend actuelle
export const getFrontendUrl = () => {
  const env = getCurrentEnv();
  return config.frontend[env];
};

// Helper pour vérifier si on est en développement
export const isDevelopment = () => getCurrentEnv() === 'development';

// Helper pour vérifier si on est en production
export const isProduction = () => getCurrentEnv() === 'production';

export default config;