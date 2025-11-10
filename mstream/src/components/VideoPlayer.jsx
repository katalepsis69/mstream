import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VideoPlayer = () => {
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

  const servers = [
    { name: 'Server 1', getUrl: (s, e) => `https://vidsrc.to/embed/${type}/${id}/${type === 'tv' ? `${s}-${e}` : ''}` },
    { name: 'Server 2', getUrl: (s, e) => `https://vidsrc.net/embed/${type}/?tmdb=${id}${type === 'tv' ? `&season=${s}&episode=${e}` : ''}` },
    { name: 'Server 3', getUrl: (s, e) => `https://player.videasy.net/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}` }
  ];

  useEffect(() => {
    if (type === 'tv') {
      fetchSeasons();
    }
  }, [type, id]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch(`/api/tv/${id}`);
      const data = await res.json();
      setSeasons(data.seasons?.filter(s => s.season_number > 0) || []);
      
      if (data.seasons?.[0]?.season_number > 0) {
        fetchEpisodes(data.seasons[0].season_number);
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

  const handleSeasonChange = (seasonNumber) => {
    setCurrentSeason(seasonNumber);
    fetchEpisodes(seasonNumber);
  };

  const getVideoUrl = () => {
    return servers[currentServer].getUrl(currentSeason, currentEpisode);
  };

  if (!type || !id) {
    return (
      <div className="error-page">
        <h1>Content not found</h1>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="watch-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Browse
        </button>
      </div>

      <div className="player-container">
        <div className="video-wrapper">
          <iframe
            src={getVideoUrl()}
            className="video-player"
            allowFullScreen
            title="Video Player"
          />
        </div>

        <div className="player-controls">
          {/* Server Selection */}
          <div className="server-selection">
            <h3>Select Server:</h3>
            <div className="server-buttons">
              {servers.map((server, index) => (
                <button
                  key={index}
                  className={`server-btn ${currentServer === index ? 'active' : ''}`}
                  onClick={() => setCurrentServer(index)}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Selection for TV Shows */}
          {type === 'tv' && (
            <div className="episode-selection">
              <div className="season-selector">
                <label>Season: </label>
                <select 
                  value={currentSeason} 
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                >
                  {seasons.map(season => (
                    <option key={season.season_number} value={season.season_number}>
                      {season.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="episode-list">
                {episodes.map(episode => (
                  <button
                    key={episode.episode_number}
                    className={`episode-btn ${currentEpisode === episode.episode_number ? 'active' : ''}`}
                    onClick={() => setCurrentEpisode(episode.episode_number)}
                  >
                    <span>E{episode.episode_number}</span>
                    <span className="episode-title">{episode.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;