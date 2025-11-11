export async function onRequest(context) {
  try {
    // Get the path and search parameters from the incoming request.
    const url = new URL(context.request.url);
    const path = url.pathname.replace('/api/', ''); // e.g., "trending/movie/week"
    
    // Get search parameters - use url.search directly to avoid double ??
    const queryString = url.search;
    
    // The base URL for the real TMDB API.
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

    // Get your secret Bearer Token from the Cloudflare environment variables.
    const TMDB_ACCESS_TOKEN = context.env.VITE_TMDB_READ_ACCESS_TOKEN;

    if (!TMDB_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          status_code: 401,
          status_message: "TMDB Access Token not configured in environment variables"
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }

    // Construct the final URL to fetch from TMDB.
    const fullURL = `${TMDB_BASE_URL}/${path}${queryString}`;

    console.log('Proxying request to TMDB:', fullURL);

    // Make the actual request to the TMDB API with Bearer Token.
    const response = await fetch(fullURL, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify(errorData),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }

    const data = await response.json();

    // Return the response from TMDB directly to your frontend.
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        status_code: 500,
        status_message: "Internal server error: " + error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}