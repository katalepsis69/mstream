import { useState, useEffect } from 'react';

const POSTER_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';
const getApiBaseUrl = () => {
  return '/api';
};

export const useTMDB = () => {
  const [movieGenres, setMovieGenres] = useState(new Map());
  const [tvGenres, setTvGenres] = useState(new Map());
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiStatus();
    fetchGenres();
  }, []);

  const buildUrl = (endpoint, params = {}) => {
    const baseUrl = getApiBaseUrl();
    
    const url = new URL(`${baseUrl}${endpoint}`, window.location.origin);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return url.toString();
  };

  const checkApiStatus = async () => {
    try {
      const testUrl = buildUrl('/configuration');
      const testResponse = await fetch(testUrl);
      
      if (testResponse.ok) {
        setApiStatus('working');
      } else {
        setApiStatus('error');
        console.error('API test failed:', await testResponse.text());
      }
    } catch (error) {
      console.error('API connection error:', error);
      setApiStatus('error');
    }
  };

  const fetchNowPlaying = async () => {
    try {
      const url = buildUrl('/movie/now_playing', {
        language: 'en-US',
        page: 1
      });
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }
      
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch now playing movies:", error);
      throw error;
    }
  };

  const fetchGenres = async () => {
    try {
      const [movieRes, tvRes] = await Promise.all([
        fetch(buildUrl('/genre/movie/list')),
        fetch(buildUrl('/genre/tv/list'))
      ]);
      
      if (!movieRes.ok) {
        throw new Error(`Movie genres failed: ${movieRes.status}`);
      }
      if (!tvRes.ok) {
        throw new Error(`TV genres failed: ${tvRes.status}`);
      }
      
      const movieData = await movieRes.json();
      const tvData = await tvRes.json();

      const movieMap = new Map(movieData.genres?.map(genre => [genre.id, genre.name]) || []);
      const tvMap = new Map(tvData.genres?.map(genre => [genre.id, genre.name]) || []);

      setMovieGenres(movieMap);
      setTvGenres(tvMap);
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    }
  };

  const fetchTrending = async (type, timeWindow = 'week') => {
    try {
      const url = buildUrl(`/trending/${type}/${timeWindow}`);
      console.log('Fetching from:', url); // Debug log
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }
      
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error(`Failed to fetch trending ${type}:`, error);
      throw error;
    }
  };

  const fetchTrendingAnime = async () => {
    try {
      const url = buildUrl('/discover/tv', {
        with_genres: 16,
        with_keywords: 210024,
        sort_by: 'popularity.desc'
      });
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }
      
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      throw error;
    }
  };

  const searchTMDB = async (query) => {
    if (!query.trim()) return [];

    try {
      const url = buildUrl('/search/multi', { 
        query: query.trim(),
        include_adult: false,
        language: 'en-US'
      });
      console.log('Search URL:', url);

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }

      const data = await res.json();
      console.log('Search results:', data);
      
      return data.results?.filter(item => {
        if (item.media_type === 'person') return false;
        
        return (item.media_type === 'movie' || item.media_type === 'tv');
      }) || [];
    } catch (error) {
      console.error("Search failed:", error);
      throw error;
    }
  };

  const fetchCredits = async (type, id) => {
    try {
      const url = buildUrl(`/${type}/${id}/credits`);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data.cast?.slice(0, 4).map(actor => actor.name) || [];
    } catch (error) {
      console.error("Failed to fetch credits:", error);
      return [];
    }
  };

  const fetchSeasonEpisodes = async (tvId, seasonNumber) => {
    try {
      const url = buildUrl(`/tv/${tvId}/season/${seasonNumber}`);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data.episodes || [];
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
      throw error;
    }
  };

  const fetchTVDetails = async (tvId) => {
    try {
      const url = buildUrl(`/tv/${tvId}`);
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Failed to fetch TV details:", error);
      throw error;
    }
  };

  const fetchDiscoverMovies = async (params = {}) => {
    try {
      const url = buildUrl('/discover/movie', {
        sort_by: 'popularity.desc',
        include_adult: false,
        include_video: false,
        language: 'en-US',
        page: 1,
        ...params
      });
      console.log('Fetching discover movies from:', url);

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }

      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch discover movies:", error);
      throw error;
    }
  };

  const fetchDiscoverTV = async (params = {}) => {
    try {
      const url = buildUrl('/discover/tv', {
        sort_by: 'popularity.desc',
        include_adult: false,
        include_null_first_air_dates: false,
        language: 'en-US',
        page: 1,
        ...params
      });
      console.log('Fetching discover TV from:', url);

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }

      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to fetch discover TV:", error);
      throw error;
    }
  };

  return {
    movieGenres,
    tvGenres,
    apiStatus,
    fetchNowPlaying,
    fetchTrending,
    fetchTrendingAnime,
    searchTMDB,
    fetchCredits,
    fetchSeasonEpisodes,
    fetchTVDetails,
    fetchDiscoverMovies,
    fetchDiscoverTV,
    POSTER_URL,
    BACKDROP_URL
  };
};