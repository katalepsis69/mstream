import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';

const Watch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  
  const [currentServer, setCurrentServer] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [contentInfo, setContentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const { fetchCredits, POSTER_URL } = useTMDB();

  const servers = [
    { 
      name: 'Server 1', 
      getUrl: (s, e) => `https://vidsrc.to/embed/${type}/${id}/${type === 'tv' ? `${s}-${e}` : ''}` 
    },
    { 
      name: 'Server 2', 
      getUrl: (s, e) => `https://vidsrc.net/embed/${type}/?tmdb=${id}${type === 'tv' ? `&season=${s}&episode=${e}` : ''}` 
    },
    { 
      name: 'Server 3', 
      getUrl: (s, e) => `https://player.videasy.net/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}` 
    }
  ];

  useEffect(() => {
    if (type && id) {
      fetchContentData();
    } else {
      setLoading(false);
    }
  }, [type, id]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic content info
      const contentRes = await fetch(`/api/${type}/${id}`);
      const contentData = await contentRes.json();
      setContentInfo(contentData);

      if (type === 'tv') {
        await fetchSeasons();
      }
    } catch (error) {
      console.error('Failed to fetch content data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await fetch(`/api/tv/${id}`);
      const data = await res.json();
      const validSeasons = data.seasons || [];
      setSeasons(validSeasons);

      if (validSeasons.length > 0) {
        setCurrentSeason(validSeasons[0].season_number);
        await fetchEpisodes(validSeasons[0].season_number);
      }
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
    }
  };

  const fetchEpisodes = async (seasonNumber) => {
    try {
      const res = await fetch(`/api/tv/${id}/season/${seasonNumber}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setCurrentEpisode(1);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
    }
  };

  const handleSeasonChange = async (seasonNumber) => {
    setCurrentSeason(seasonNumber);
    await fetchEpisodes(seasonNumber);
  };

  const getVideoUrl = () => {
    return servers[currentServer].getUrl(currentSeason, currentEpisode);
  };

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="loading-spinner"></div>
        <p>Loading player...</p>
      </div>
    );
  }

  if (!type || !id) {
    return (
      <div className="watch-error">
        <div className="error-content">
          <h1>Content Not Found</h1>
          <p>The requested content could not be loaded.</p>
          <button 
            className="back-home-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-page">
      {/* Header */}
      <div className="watch-header">
        <div className="watch-header-content">
          <button
            className="back-browse-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Browse
          </button>

          {type === 'tv' && (
            <div className="season-episode-badge">
              S{currentSeason} • E{currentEpisode}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="breadcrumb">
        Home &gt;&gt; {type === 'movie' ? 'Movies' : 'TV Shows'} &gt;&gt; {contentInfo?.title || contentInfo?.name}
      </div>
      <div className="watch-container">
        {/* Video Player */}
        <div className="player-section">
          <div className="video-container">
            <iframe
              src={getVideoUrl()}
              className="video-player"
              allowFullScreen
              title="Video Player"
              key={`${currentServer}-${currentSeason}-${currentEpisode}`}
            />
          </div>

          {/* Server Selection */}
          <div className="server-section">
            <h3 className="section-title">Select Server</h3>
            <div className="server-grid">
              {servers.map((server, index) => (
                <button
                  key={index}
                  className={`server-card ${currentServer === index ? 'active' : ''}`}
                  onClick={() => setCurrentServer(index)}
                >
                  <div className="server-icon">📺</div>
                  <span className="server-name">{server.name}</span>
                  {currentServer === index && (
                    <div className="active-indicator"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Episode Selection for TV Shows */}
          {type === 'tv' && (
            <div className="episode-section">
              <div className="season-selector">
                <label className="selector-label">Season</label>
                <select 
                  value={currentSeason} 
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  className="season-dropdown"
                >
                  {seasons.map(season => (
                    <option key={season.season_number} value={season.season_number}>
                      {season.name} ({season.episode_count} episodes)
                    </option>
                  ))}
                </select>
              </div>

              <div className="episodes-grid">
                <h4 className="episodes-title">Episodes</h4>
                <div className="episodes-list">
                  {episodes.map(episode => (
                    <button
                      key={episode.episode_number}
                      className={`episode-card ${currentEpisode === episode.episode_number ? 'active' : ''}`}
                      onClick={() => setCurrentEpisode(episode.episode_number)}
                    >
                      <div className="episode-number">
                        E{episode.episode_number}
                      </div>
                      <div className="episode-content">
                        <div className="episode-title">{episode.name}</div>
                        <div className="episode-meta">
                          {episode.runtime && (
                            <span className="episode-runtime">{episode.runtime}m</span>
                          )}
                          {episode.air_date && (
                            <span className="episode-date">
                              {new Date(episode.air_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Information */}
          {contentInfo && (
            <div className="info-section">
              <h3 className="section-title">About this {type === 'movie' ? 'Movie' : 'Show'}</h3>
              <div className="content-card">
                <img 
                  src={`${POSTER_URL}${contentInfo.poster_path}`} 
                  alt={contentInfo.title || contentInfo.name}
                  className="content-poster"
                />
                <div className="content-details">
                  <p className="content-overview">{contentInfo.overview}</p>
                  <div className="content-stats">
                    <div className="stat-item">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{contentInfo.vote_average?.toFixed(1)}/10</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">🗓️</span>
                      <span className="stat-value">
                        {contentInfo.release_date?.substring(0, 4) || contentInfo.first_air_date?.substring(0, 4)}
                      </span>
                    </div>
                    {contentInfo.runtime && (
                      <div className="stat-item">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-value">{contentInfo.runtime}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;