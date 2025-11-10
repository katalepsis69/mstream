// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onSearchClick, searchResults, onItemClick }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    // Open search modal when input is focused
    onSearchClick();
  };

  const handleSearchBlur = (e) => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/img/mstream-new.png" 
            alt="MSTREAM Logo" 
            className="logo-image"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/tv-shows" className="nav-link">TV Shows</Link>
          <Link to="/movies" className="nav-link">Movies</Link>
          <Link to="/popular" className="nav-link">Popular</Link>
        </div>

        <div className="navbar-search-container">
          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleSearchBlur}
              className="navbar-search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Side Menu */}
        <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="side-menu-header">
            <h3>Menu</h3>
            <button className="close-menu" onClick={closeMenu} aria-label="Close menu">
              &times;
            </button>
          </div>
          <div className="side-menu-links">
            <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
            <Link to="/tv-shows" className="nav-link" onClick={closeMenu}>TV Shows</Link>
            <Link to="/movies" className="nav-link" onClick={closeMenu}>Movies</Link>
            <Link to="/popular" className="nav-link" onClick={closeMenu}>Popular</Link>
          </div>
        </div>

        {/* Overlay when menu is open */}
        {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      </div>
    </nav>
  );
};

export default Navbar;