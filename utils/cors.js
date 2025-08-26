// Helper pour gérer CORS dans les fonctions Vercel
const allowedOrigins = [
  'https://benbridgen.com',
  'https://www.benbridgen.com',
  // En développement local (optionnel)
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : [])
];

export const setCorsHeaders = (res, origin) => {
  // Vérifier si l'origine est autorisée
  const isAllowed = allowedOrigins.includes(origin) || 
                   (process.env.NODE_ENV === 'development' && origin?.includes('localhost'));

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 heures
};

export const handleCors = (req, res) => {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indique que la requête a été traitée
  }

  return false; // Continuer le traitement normal
};