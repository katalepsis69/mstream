// ===================================
// CONFIGURATION
// ===================================

const BASE_URL = '/api'; // This now routes to your Cloudflare Function
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// ===================================
// DATA FETCHING FUNCTIONS
// ===================================

async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }
  const res = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`);
  const data = await res.json();
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  data.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    container.appendChild(img);
  });
}


// ===================================
// UI DISPLAY FUNCTIONS (These were missing)
// ===================================

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer(); // Set the initial server URL
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  // In search results, media_type is present. In trending, it is not.
  // We need to determine if it's a movie or tv show. `release_date` exists on movies but not tv shows.
  const type = currentItem.media_type === "movie" || currentItem.release_date ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = ''; // Stop video playback
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
}

function slide(listId, direction) {
  const list = document.getElementById(listId);
  if (!list) return;

  // Calculate the amount to scroll. We'll scroll by 80% of the visible width.
  const scrollAmount = list.clientWidth * 0.8;

  if (direction === 'left') {
    list.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  } else {
    list.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
}

// ===================================
// INITIALIZATION
// ===================================

async function init() {
  try {
    const movies = await fetchTrending('movie');
    const tvShows = await fetchTrending('tv');
    const anime = await fetchTrendingAnime();

    if (movies && movies.length > 0) {
      displayBanner(movies[Math.floor(Math.random() * movies.length)]);
      displayList(movies, 'movies-list');
    }
    if (tvShows && tvShows.length > 0) {
      displayList(tvShows, 'tvshows-list');
    }
    if (anime && anime.length > 0) {
      displayList(anime, 'anime-list');
    }
  } catch (error) {
    console.error("Failed to initialize page:", error);
    // Optionally display an error message to the user on the page
  }
}

// Run the app
init();