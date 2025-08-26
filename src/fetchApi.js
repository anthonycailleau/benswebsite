export const fetchApi = async (url, options = {}, retries = 1) => {
  // Détermine l'URL de base selon l'environnement
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://benbridgen.com" // ton domaine de production
      : ""; // local : laisse vide pour /api/...

  try {
    const res = await fetch(baseUrl + url, options);

    if (!res.ok) {
      let errorMessage = `${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        if (data.error) errorMessage = data.error;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }

    return await res.text();
  } catch (err) {
    if (retries > 0) {
      console.warn(`Fetch failed for ${url}, retrying... (${retries} left)`);
      return fetchApi(url, options, retries - 1);
    } else {
      throw new Error(`Network or server error: ${err.message}`);
    }
  }
};