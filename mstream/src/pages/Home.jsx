import React, { useState, useEffect } from 'react';
import BannerSlider from '../components/BannerSlider';
import MovieRow from '../components/MovieRow';
import Modal from '../components/Modal';
import SearchModal from '../components/SearchModal';
import { useTMDB } from '../hooks/useTMDB';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const { 
    movieGenres, 
    tvGenres, 
    fetchTrending, 
    fetchTrendingAnime, 
    searchTMDB, 
    fetchCredits 
  } = useTMDB();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const [movies, tvShows, anime] = await Promise.all([
        fetchTrending('movie'),
        fetchTrending('tv'),
        fetchTrendingAnime()
      ]);

      setTrendingMovies(movies);
      setTrendingTV(tvShows);
      setTrendingAnime(anime);
    } catch (error) {
      console.error("Failed to initialize data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchTMDB(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleItemClick = async (item) => {
    const type = item.media_type === "movie" || item.release_date ? "movie" : "tv";
    const genreMap = type === 'movie' ? movieGenres : tvGenres;
    const genreNames = item.genre_ids?.map(id => genreMap.get(id)).filter(Boolean) || [];
    
    const cast = await fetchCredits(type, item.id);

    setSelectedItem({
      ...item,
      type,
      genres: genreNames,
      cast: cast.join(', ') || 'N/A'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading amazing content...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Banner Slider - Only show if we have movies */}
      {trendingMovies.length > 0 && (
        <BannerSlider 
          movies={trendingMovies.slice(0, 5)} 
          onItemClick={handleItemClick}
        />
      )}

      {/* Content Rows - Only show if we have content */}
      <div className="content-rows">
        {trendingMovies.length > 0 && (
          <MovieRow 
            title="Trending Movies" 
            items={trendingMovies} 
            onItemClick={handleItemClick}
          />
        )}
        
        {trendingTV.length > 0 && (
          <MovieRow 
            title="Trending TV Shows" 
            items={trendingTV} 
            onItemClick={handleItemClick}
          />
        )}
        
        {trendingAnime.length > 0 && (
          <MovieRow 
            title="Trending Anime" 
            items={trendingAnime} 
            onItemClick={handleItemClick}
          />
        )}
      </div>

      {/* Modals */}
      {isModalOpen && selectedItem && (
        <Modal item={selectedItem} onClose={closeModal} />
      )}

      {isSearchOpen && (
        <SearchModal 
          searchResults={searchResults}
          onSearch={handleSearch}
          onClose={closeSearch}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );
};

export default Home;