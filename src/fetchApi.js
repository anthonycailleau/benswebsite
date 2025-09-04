const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  return 'https://www.benbridgen.com';
};

export const fetchApi = async (endpoint, options = {}, retries = 1) => {
  try {
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`📡 Calling API: ${url}`);

    const res = await fetch(url, defaultOptions);
    const contentType = res.headers.get('content-type') || '';

    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (err) {
    console.error(`❌ API Error for ${endpoint}:`, err.message);
    
    if (retries > 0) {
      console.warn(`🔄 Retrying ${endpoint}... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchApi(endpoint, options, retries - 1);
    } else {
      throw new Error(`Network or server error: ${err.message}`);
    }
  }
};

export default fetchApi;