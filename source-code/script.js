// ===================== DATA & PENYIMPANAN =====================
const STORAGE_KEY = 'myMoviesData';

const defaultMovies = [
    {
        id: 1,
        title: "Cyberpunk: Neo Nusantara",
        type: "legal",
        rating: "8.8",
        year: "2026",
        quality: "1080p",
        genre: "Sci-Fi",
        country: "Indonesia",
        image: "https://picsum.photos/200/290?random=1",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        synopsis: "Di megalopolis Neo-Jakarta masa depan, seorang hacker jenius menemukan konspirasi di balik sistem AI."
    },
    {
        id: 2,
        title: "The Silent Ocean",
        type: "legal",
        rating: "8.2",
        year: "2025",
        quality: "720p",
        genre: "Thriller",
        country: "Korea",
        image: "https://picsum.photos/200/290?random=2",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        synopsis: "Misi penyelamatan dasar laut berujung pada penemuan spesies yang tidak pernah terbayangkan."
    }
];

function loadMoviesFromStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) {
            // Link blob: (dari upload file lokal) tidak berlaku lagi setelah halaman di-refresh,
            // jadi dibuang agar tidak muncul film yang videonya tidak bisa diputar.
            return saved.filter(m => !String(m.videoUrl).startsWith('blob:'));
        }
    } catch (err) {
        console.error('Gagal membaca LocalStorage:', err);
    }
    return defaultMovies;
}

function saveMoviesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(moviesData));
    } catch (err) {
        console.error('Gagal menyimpan ke LocalStorage:', err);
    }
}

let moviesData = loadMoviesFromStorage();
let currentSourceMode = 'legal';
let selectedMovie = moviesData[0] || null;

// ===================== RENDER KATALOG =====================
function renderMovieGrid(items) {
    const grid = document.getElementById('movieGrid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Tidak ada film ditemukan.</p>`;
        document.getElementById('resultsCount').innerText = 'Menampilkan 0 film';
        return;
    }

    items.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <span class="country-tag">${movie.country}</span>
            <span class="movie-card-badge">${movie.quality}</span>
            <button class="delete-movie-btn" onclick="deleteMovie(event, ${movie.id})" title="Hapus Film">
                <i class="fa-solid fa-trash"></i>
            </button>
            <img src="${movie.image}" alt="${movie.title}" onclick="playSelectedMovie(${movie.id})">
            <div class="movie-card-info" onclick="playSelectedMovie(${movie.id})">
                <h4>${movie.title}</h4>
                <div class="movie-card-meta">
                    <span>★ ${movie.rating}</span>
                    <span>${movie.genre}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.getElementById('resultsCount').innerText = `Menampilkan ${items.length} film`;
}

// ===================== HAPUS FILM =====================
function deleteMovie(event, movieId) {
    // Cegah klik kartu ikut terpicu (agar video tidak langsung diputar)
    event.stopPropagation();

    if (confirm("Apakah Anda yakin ingin menghapus film ini?")) {
        moviesData = moviesData.filter(movie => movie.id !== movieId);
        saveMoviesToStorage();
        filterMovies();
        alert("Film berhasil dihapus!");
    }
}

// ===================== FILTER MULTI-KRITERIA =====================
function filterMovies() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const genreVal = document.getElementById('genreSelect').value;
    const countryVal = document.getElementById('countrySelect').value;
    const qualityVal = document.getElementById('qualitySelect').value;

    const filtered = moviesData.filter(m => {
        const matchesMode = m.type === currentSourceMode;
        const matchesSearch = m.title.toLowerCase().includes(searchVal) || m.genre.toLowerCase().includes(searchVal);
        const matchesGenre = genreVal === 'all' || m.genre === genreVal;
        const matchesCountry = countryVal === 'all' || m.country === countryVal;
        const matchesQuality = qualityVal === 'all' || m.quality === qualityVal;

        return matchesMode && matchesSearch && matchesGenre && matchesCountry && matchesQuality;
    });

    renderMovieGrid(filtered);
}

// ===================== TOGGLE MODE LEGAL / ALTERNATIF =====================
function setMode(mode) {
    currentSourceMode = mode;
    document.getElementById('btnLegal').classList.toggle('active', mode === 'legal');
    document.getElementById('btnAlt').classList.toggle('active', mode === 'alt');
    filterMovies();
}

// ===================== PEMUTARAN VIDEO =====================
function playSelectedMovie(movieId) {
    const found = moviesData.find(m => m.id === movieId);
    if (!found) return;
    selectedMovie = found;

    document.getElementById('detailTitle').innerText = selectedMovie.title;
    document.getElementById('detailPoster').src = selectedMovie.image;
    document.getElementById('detailSynopsis').innerText = selectedMovie.synopsis;
    document.getElementById('detailQuality').innerText = selectedMovie.quality;
    document.getElementById('detailCountry').innerText = selectedMovie.country;
    document.getElementById('detailYear').innerText = selectedMovie.year;
    document.getElementById('detailGenres').innerHTML = `<span class="pill-item">${selectedMovie.genre}</span>`;

    const videoWrapper = document.getElementById('videoWrapper');

    // Iframe/embed vs MP4 (lokal maupun online)
    if (selectedMovie.videoUrl.includes('youtube.com/embed') || selectedMovie.videoUrl.includes('player.vimeo.com')) {
        videoWrapper.innerHTML = `<iframe src="${selectedMovie.videoUrl}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        videoWrapper.innerHTML = `
            <video controls autoplay style="width: 100%; height: 100%;">
                <source src="${selectedMovie.videoUrl}" type="video/mp4">
                Browser Anda tidak mendukung pemutaran video ini.
            </video>
        `;
    }

    switchPage('detail');
}

function switchPage(pageId) {
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    window.scrollTo(0, 0);
}

function scrollToPlayer() {
    document.getElementById('playerSection').scrollIntoView({ behavior: 'smooth' });
}

// ===================== MODAL TAMBAH FILM =====================
function openAddMovieModal() {
    document.getElementById('addMovieModalOverlay').classList.add('active');
    document.getElementById('addMovieModal').classList.add('active');
}

function closeAddMovieModal() {
    document.getElementById('addMovieModalOverlay').classList.remove('active');
    document.getElementById('addMovieModal').classList.remove('active');
}

function toggleVideoSourceInput() {
    const sourceType = document.getElementById('videoSourceType').value;
    const fileGroup = document.getElementById('fileSourceGroup');
    const urlGroup = document.getElementById('urlSourceGroup');

    if (sourceType === 'file') {
        fileGroup.style.display = 'flex';
        urlGroup.style.display = 'none';
        document.getElementById('inputVideoFile').required = true;
        document.getElementById('inputVideoUrl').required = false;
    } else {
        fileGroup.style.display = 'none';
        urlGroup.style.display = 'flex';
        document.getElementById('inputVideoFile').required = false;
        document.getElementById('inputVideoUrl').required = true;
    }
}

// ===================== SIMPAN FILM BARU =====================
function handleAddNewMovie(e) {
    e.preventDefault();

    const sourceType = document.getElementById('videoSourceType').value;
    let generatedVideoUrl = '';

    if (sourceType === 'file') {
        const fileInput = document.getElementById('inputVideoFile');
        if (fileInput.files && fileInput.files[0]) {
            generatedVideoUrl = URL.createObjectURL(fileInput.files[0]);
        } else {
            alert('Silakan pilih file video dari perangkat Anda.');
            return;
        }
    } else {
        generatedVideoUrl = document.getElementById('inputVideoUrl').value;
    }

    const newMovie = {
        id: Date.now(),
        title: document.getElementById('inputTitle').value,
        country: document.getElementById('inputCountry').value,
        genre: document.getElementById('inputGenre').value,
        quality: document.getElementById('inputQuality').value,
        type: document.getElementById('inputType').value,
        year: document.getElementById('inputYear').value || "2026",
        rating: "8.5",
        image: document.getElementById('inputImage').value || "https://picsum.photos/200/290?random=" + Math.floor(Math.random() * 100),
        videoUrl: generatedVideoUrl,
        synopsis: document.getElementById('inputSynopsis').value || "Belum ada sinopsis."
    };

    moviesData.unshift(newMovie);
    saveMoviesToStorage();

    closeAddMovieModal();
    document.getElementById('addMovieForm').reset();
    toggleVideoSourceInput();

    setMode(newMovie.type);
    playSelectedMovie(newMovie.id);
}

// ===================== INISIALISASI =====================
filterMovies();
