import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Popular from './pages/Popular';
import Watch from './pages/Watch';
import About from './pages/About';
import Disclaimer from './pages/Disclaimer';
import SearchModal from './components/SearchModal';
import { useTMDB } from './hooks/useTMDB';
import Footer from './components/Footer';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTMDB } = useTMDB();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchTMDB(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchResults([]);
  };

  const handleItemClick = (item) => {
    // Handle item click - you might want to navigate to detail page or show modal
    console.log('Item clicked:', item);
    handleSearchClose();
  };

  return (
      <div className="App">
        <Navbar
          onSearchClick={handleSearchClick}
          searchResults={searchResults}
          onItemClick={handleItemClick}
        />
        
        {isSearchOpen && (
          <SearchModal
            searchResults={searchResults}
            onSearch={handleSearch}
            onClose={handleSearchClose}
            onItemClick={handleItemClick}
            isSearching={isSearching}
          />
        )}
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/about" element={<About />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;