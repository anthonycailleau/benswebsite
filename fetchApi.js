// Configuration de l'API en fonction de l'environnement
const getApiBaseUrl = () => {
  // En développement local
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000'; // ou le port de votre dev server local
  }
  
  // En production
  return 'https://benbridgen.com';
};

export const fetchApi = async (endpoint, options = {}, retries = 1) => {
  try {
    // Construction de l'URL complète
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
    
    // Configuration par défaut des options
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`📡 Calling API: ${url}`); // Debug log

    const res = await fetch(url, defaultOptions);

    if (!res.ok) {
      let errorMessage = `${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        if (data.error) errorMessage = data.error;
      } catch (_) {
        // Si on ne peut pas parser le JSON d'erreur, on garde le message par défaut
      }
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }

    return await res.text();
  } catch (err) {
    console.error(`❌ API Error for ${endpoint}:`, err.message);
    
    if (retries > 0) {
      console.warn(`🔄 Retrying ${endpoint}... (${retries} attempts left)`);
      // Délai avant retry (optionnel)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchApi(endpoint, options, retries - 1);
    } else {
      throw new Error(`Network or server error: ${err.message}`);
    }
  }
};

export default fetchApi;