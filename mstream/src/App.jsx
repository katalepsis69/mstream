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
import { useTMDB } from './hooks/useTMDB';
import Footer from './components/Footer';

function App() {
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

  const handleItemClick = (item) => {
    // Handle item click - you might want to navigate to detail page or show modal
    console.log('Item clicked:', item);
    setSearchResults([]); // Clear search results when item is clicked
  };

  return (
      <div className="App">
        <Navbar
          onSearch={handleSearch} // Changed from onSearchClick to onSearch
          searchResults={searchResults}
          onItemClick={handleItemClick}
          isSearching={isSearching} // Added this prop
        />
        
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