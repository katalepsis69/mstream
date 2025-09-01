// js/watch.js

document.addEventListener('DOMContentLoaded', async () => {
    // Get HTML elements
    const videoFrame = document.getElementById('video-frame');
    const serverButtonsContainer = document.getElementById('server-buttons');
    const episodeGuide = document.getElementById('episode-guide');
    const seasonSelector = document.getElementById('season-selector');
    const episodeList = document.getElementById('episode-list');

    // Get content details from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    // State to keep track of current selection
    let currentServerUrl;
    let currentSeason = 1;
    let currentEpisode = 1;

    if (!type || !id) {
        document.body.innerHTML = '<h1>Error: Content information missing.</h1>';
        return;
    }

    // --- Server Definitions ---
    // Note: The URLs are now functions to build them dynamically
    const servers = [
        { name: 'VidSrc', getUrl: (s, e) => `https://vidsrc.cc/v2/embed/${type}/${id}${type === 'tv' ? `?s=${s}&e=${e}` : ''}` },
        { name: 'VidSrc.me', getUrl: (s, e) => `https://vidsrc.net/embed/${type}/?tmdb=${id}${type === 'tv' ? `&season=${s}&episode=${e}` : ''}` },
        { name: 'Videasy', getUrl: (s, e) => `https://player.videasy.net/${type}/${id}${type === 'tv' ? `?s=${s}&e=${e}` : ''}` }
    ];

    // --- Core Functions ---
    function updateVideoSource() {
        if (currentServerUrl) {
            videoFrame.src = currentServerUrl(currentSeason, currentEpisode);
        }
    }

    async function fetchAndDisplayEpisodes(seasonNumber) {
        // Fetch details for the selected season
        const res = await fetch(`/api/tv/${id}/season/${seasonNumber}`);
        const data = await res.json();
        
        episodeList.innerHTML = ''; // Clear previous episodes
        data.episodes.forEach(episode => {
            const button = document.createElement('button');
            button.className = 'episode-btn';
            button.innerText = `Ep ${episode.episode_number}: ${episode.name}`;
            button.dataset.episodeNumber = episode.episode_number;

            button.addEventListener('click', () => {
                currentEpisode = episode.episode_number;
                updateVideoSource();
                // Update active button style
                document.querySelectorAll('.episode-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });

            episodeList.appendChild(button);
        });
        // Set the first episode as active by default
        document.querySelector('.episode-btn')?.classList.add('active');
    }

    // --- Initialization Logic ---
    // 1. Generate Server Buttons
    servers.forEach((server, index) => {
        const button = document.createElement('button');
        button.className = 'server-btn';
        button.innerText = server.name;

        button.addEventListener('click', () => {
            currentServerUrl = server.getUrl;
            updateVideoSource();
            document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });

        serverButtonsContainer.appendChild(button);
        if (index === 0) {
            currentServerUrl = server.getUrl; // Set default server
            button.classList.add('active');
        }
    });

    // 2. Handle TV Shows vs Movies
    if (type === 'tv') {
        episodeGuide.style.display = 'block'; // Show the selectors
        // Fetch show details to get season list
        const res = await fetch(`/api/tv/${id}`);
        const data = await res.json();

        data.seasons.forEach(season => {
            // Don't show "Specials" (season 0) unless you want to
            if (season.season_number > 0) {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.innerText = season.name;
                seasonSelector.appendChild(option);
            }
        });

        seasonSelector.addEventListener('change', () => {
            currentSeason = seasonSelector.value;
            currentEpisode = 1; // Reset to episode 1 when changing season
            fetchAndDisplayEpisodes(currentSeason);
            updateVideoSource();
        });

        // Load episodes for the default season (Season 1)
        await fetchAndDisplayEpisodes(currentSeason);
    }
    
    // 3. Load the initial video
    updateVideoSource();
});