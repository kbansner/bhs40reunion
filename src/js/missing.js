/* ===================================
   MISSING CLASSMATES SEARCH TOOL
   JavaScript for missing.html
   =================================== */

// Real missing classmates data with yearbook photos
const missingClassmates = [
    { name: "Elliott, Aaron", letter: "E", thumbnail: "https://bhs40.com/grad-thumbnails/001_aaron-elliott.jpg" },
    { name: "Brown, Aaron", letter: "B", thumbnail: "https://bhs40.com/grad-thumbnails/002_aaron-brown.jpg" },
    { name: "Feldman, Aaron", letter: "F", thumbnail: "https://bhs40.com/grad-thumbnails/003_aaron-feldman.jpg" },
    { name: "Ott, Aaron", letter: "O", thumbnail: "https://bhs40.com/grad-thumbnails/004_aaron-ott.jpg" },
    { name: "Brownson, Aaron", letter: "B", thumbnail: "https://bhs40.com/grad-thumbnails/005_aaron-brownson.jpg" },
    { name: "Myles, Achebe", letter: "M", thumbnail: "https://bhs40.com/grad-thumbnails/006_achebe-myles.jpg" },
    { name: "Clark, Adam", letter: "C", thumbnail: "https://bhs40.com/grad-thumbnails/007_adam-clark.jpg" },
    { name: "Woods, Adrian", letter: "W", thumbnail: "https://bhs40.com/grad-thumbnails/008_adrian-woods.jpg" },
    { name: "Harris, Adriene", letter: "H", thumbnail: "https://bhs40.com/grad-thumbnails/009_adriene-harris.jpg" },
    { name: "Wilkin, Alex", letter: "W", thumbnail: "https://bhs40.com/grad-thumbnails/010_alex-wilkin.jpg" },
    { name: "Harte, Alexis", letter: "H", thumbnail: "https://bhs40.com/grad-thumbnails/011_alexis-harte.jpg" },
    { name: "Buchanan, Alice", letter: "B", thumbnail: "https://bhs40.com/grad-thumbnails/012_alice-buchanan.jpg" },
    { name: "Wilson, Alice", letter: "W", thumbnail: "https://bhs40.com/grad-thumbnails/013_alice-wilson.jpg" },
    { name: "Nellis, Alicea", letter: "N", thumbnail: "https://bhs40.com/grad-thumbnails/014_alicea-nellis.jpg" },
    { name: "Taylor, Alicia", letter: "T", thumbnail: "https://bhs40.com/grad-thumbnails/015_alicia-taylor.jpg" },
    { name: "Price, Alison", letter: "P", thumbnail: "https://bhs40.com/grad-thumbnails/017_alison-price.jpg" },
    { name: "Schulz, Alison", letter: "S", thumbnail: "https://bhs40.com/grad-thumbnails/018_alison-schulz.jpg" },
    { name: "Johnson, Alison", letter: "J", thumbnail: "https://bhs40.com/grad-thumbnails/019_alison-johnson.jpg" },
    { name: "Brown, Alison", letter: "B", thumbnail: "https://bhs40.com/grad-thumbnails/020_alison-brown.jpg" },
    { name: "Cohen, Allan", letter: "C", thumbnail: "https://bhs40.com/grad-thumbnails/021_allan-cohen.jpg" },
    { name: "Ray, Allegheny", letter: "R", thumbnail: "https://bhs40.com/grad-thumbnails/022_allegheny-ray.jpg" },
    { name: "Edington, Alphonso", letter: "E", thumbnail: "https://bhs40.com/grad-thumbnails/023_alphonso-edington.jpg" },
    { name: "Miller, Amanda", letter: "M", thumbnail: "https://bhs40.com/grad-thumbnails/024_amanda-miller.jpg" },
    { name: "Kreppel, Amie", letter: "K", thumbnail: "https://bhs40.com/grad-thumbnails/026_amie-kreppel.jpg" },
    { name: "Steinbach, Aminta", letter: "S", thumbnail: "https://bhs40.com/grad-thumbnails/027_aminta-steinbach.jpg" },
    { name: "Inacay, Amor", letter: "I", thumbnail: "https://bhs40.com/grad-thumbnails/028_amor-inacay.jpg" },
    { name: "Montali, Amy", letter: "M", thumbnail: "https://bhs40.com/grad-thumbnails/029_amy-montali.jpg" },
    { name: "Sessions, Amy", letter: "S", thumbnail: "https://bhs40.com/grad-thumbnails/030_amy-sessions.jpg" },
    { name: "Muckelroy, Amy", letter: "M", thumbnail: "https://bhs40.com/grad-thumbnails/031_amy-muckelroy.jpg" },
    { name: "Johnson, Amy", letter: "J", thumbnail: "https://bhs40.com/grad-thumbnails/034_amy-johnson.jpg" },
    { name: "Fitzsimons, Amy", letter: "F", thumbnail: "https://bhs40.com/grad-thumbnails/035_amy-fitzsimons.jpg" }
];

// State
let filteredClassmates = [...missingClassmates];
let currentGridCols = 4;

// DOM Elements
const searchInput = document.getElementById('search-input');
const classmatesGrid = document.getElementById('classmates-grid');
const alphabetButtons = document.getElementById('alphabet-buttons');
const showAllBtn = document.getElementById('show-all-btn');
const noResults = document.getElementById('no-results');
const showingCount = document.getElementById('showing-count');
const totalCount = document.getElementById('total-count');
const totalCount2 = document.getElementById('total-count-2');

// Initialize page
function init() {
    // Set total count
    totalCount.textContent = missingClassmates.length;
    totalCount2.textContent = missingClassmates.length;
    
    // Generate alphabet buttons
    generateAlphabetButtons();
    
    // Render initial grid
    renderGrid();
    
    // Add event listeners
    attachEventListeners();
}

// Generate A-Z alphabet buttons
function generateAlphabetButtons() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    alphabet.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'btn-letter';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.addEventListener('click', () => filterByLetter(letter));
        alphabetButtons.appendChild(btn);
    });
}

// Attach event listeners
function attachEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
    
    // Show All button
    showAllBtn.addEventListener('click', showAll);
    
    // Grid view buttons
    const viewButtons = document.querySelectorAll('.btn-view');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cols = parseInt(btn.dataset.cols);
            changeGridCols(cols);
            
            // Update active state
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Handle search
function handleSearch(searchTerm) {
    if (searchTerm.trim() === '') {
        filteredClassmates = [...missingClassmates];
    } else {
        filteredClassmates = missingClassmates.filter(person =>
            person.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    renderGrid();
}

// Filter by letter
function filterByLetter(letter) {
    filteredClassmates = missingClassmates.filter(person => 
        person.letter === letter
    );
    searchInput.value = '';
    renderGrid();
}

// Show all classmates
function showAll() {
    filteredClassmates = [...missingClassmates];
    searchInput.value = '';
    renderGrid();
}

// Change grid columns
function changeGridCols(cols) {
    currentGridCols = cols;
    classmatesGrid.className = `classmates-grid grid-cols-${cols}`;
}

// Render the grid
function renderGrid() {
    // Update count
    showingCount.textContent = filteredClassmates.length;
    
    // Clear grid
    classmatesGrid.innerHTML = '';
    
    // Show/hide no results
    if (filteredClassmates.length === 0) {
        noResults.style.display = 'block';
        classmatesGrid.style.display = 'none';
    } else {
        noResults.style.display = 'none';
        classmatesGrid.style.display = 'grid';
        
        // Render cards
        filteredClassmates.forEach((person, index) => {
            const card = createClassmateCard(person, index);
            classmatesGrid.appendChild(card);
        });
    }
}

// Create a classmate card
function createClassmateCard(person, index) {
    const card = document.createElement('div');
    card.className = 'classmate-card';
    
    card.innerHTML = `
        <div class="classmate-thumbnail">
            <img 
                src="${person.thumbnail}" 
                alt="${person.name}"
                onload="this.style.display='block'"
                onerror="handleImageError(this)"
            />
            <div class="image-error" id="error-${index}">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
        </div>
        <div class="classmate-content">
            <h3 class="classmate-name">${person.name}</h3>
            <div class="action-buttons">
                <button class="btn-action btn-email" onclick="searchFacebook('${person.name}')">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Them
                </button>
                <button class="btn-action btn-text" onclick="searchGoogle('${person.name}')">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Text Them
                </button>
                <button class="btn-action btn-share" onclick="markFound('${person.name}')">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Share Their Info
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Handle image error
function handleImageError(img) {
    img.classList.add('error');
    img.style.display = 'none';
    const errorDiv = img.nextElementSibling;
    if (errorDiv) {
        errorDiv.classList.add('show');
    }
}

// Action handlers
function searchFacebook(name) {
    const searchQuery = encodeURIComponent(name + ' Berkeley High School');
    window.open(`https://www.facebook.com/search/top/?q=${searchQuery}`, '_blank');
}

function searchGoogle(name) {
    const searchQuery = encodeURIComponent(name + ' Berkeley High School Class of 1986');
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
}

function markFound(name) {
    if (confirm(`Mark ${name} as FOUND?\n\nThis will open a form to submit their contact information.`)) {
        const formUrl = `https://forms.gle/BQduAPNC67e2U9YQ7?entry.NAME=${encodeURIComponent(name)}`;
        window.open(formUrl, '_blank');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
