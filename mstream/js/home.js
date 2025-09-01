// ===================================
// CONFIGURATION
// ===================================

const BASE_URL = '/api'; // This now routes to your Cloudflare Function
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

let bannerSlidesData = [];
let currentBannerIndex = 0;
let bannerInterval;

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

// In js/home.js

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  
  const watchButton = document.getElementById('watch-button');
  const type = item.media_type === "movie" || item.release_date ? "movie" : "tv";
  
  // **THIS IS THE IMPORTANT CHANGE**
  // Update the link to point to your new watch page
  watchButton.href = `watch.html?type=${type}&id=${item.id}`;
  
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
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
// BANNER SLIDER FUNCTIONS
// ===================================

function setupBannerSlider(movies) {
  bannerSlidesData = movies.slice(0, 5); // Use the first 5 movies
  const slidesContainer = document.getElementById('banner-slides');
  const dotsContainer = document.getElementById('banner-dots');

  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  bannerSlidesData.forEach((movie, index) => {
    // Create Slide
    const slide = document.createElement('div');
    slide.className = 'banner-slide';
    slide.style.backgroundImage = `url(${IMG_URL}${movie.backdrop_path})`;
    const title = document.createElement('h1');
    title.textContent = movie.title || movie.name;
    slide.appendChild(title);
    slidesContainer.appendChild(slide);

    // Create Dot
    const dot = document.createElement('div');
    dot.className = 'banner-dot';
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  showSlide(0);
  startBannerAutoplay();
}

function showSlide(index) {
  const slidesContainer = document.getElementById('banner-slides');
  if (!slidesContainer) return; // Add safety check
  
  const dots = document.querySelectorAll('.banner-dot');
  currentBannerIndex = index;
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// This new function is for the automatic timer ONLY
function autoAdvanceSlide() {
    const nextIndex = (currentBannerIndex + 1) % bannerSlidesData.length;
    showSlide(nextIndex);
}

function goToSlide(index) {
  showSlide(index);
  resetBannerAutoplay();
}

function startBannerAutoplay() {
  // Use the new auto-advance function for the timer
  bannerInterval = setInterval(autoAdvanceSlide, 5000);
}

function resetBannerAutoplay() {
  clearInterval(bannerInterval);
  startBannerAutoplay();
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
      setupBannerSlider(movies);
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