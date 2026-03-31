/* ===================================
   MISSING CLASSMATES SEARCH TOOL
   Dynamic Feed Version for BHS '86
   =================================== */

// State
let allMissingData = []; // Full dataset from Google Sheet/JSON
let filteredClassmates = []; // Current filtered view
let currentGridCols = 5;

// DOM Elements
const searchInput = document.getElementById("search-missing"); // Updated ID to match your main.js
const classmatesGrid = document.getElementById("classmates-grid");
const alphabetButtons = document.getElementById("alphabet-buttons");
const showAllBtn = document.getElementById("show-all-btn");
const noResults = document.getElementById("no-results");
const showingCount = document.getElementById("results-count"); // Updated ID to match main.js
const totalCount = document.getElementById("total-count");
const totalCount2 = document.getElementById("total-count-2");

/**
 * Helper: Generate the thumbnail URL
 * Matches the required format for BHS '86 classmates
 */
function getThumbnailUrl(name, uid) {
  // 1. Clean the UID (e.g., "BHS-001" -> "001")
  const numericUid = uid.replace("BHS-", "");

  // 2. Process the Name
  // Split "Brown, Aaron E." into ["Brown", "Aaron E."]
  const parts = name.split(",").map((p) => p.trim().toLowerCase());

  let lastName = parts[0] || "";
  let firstName = parts[1] || "";

  // 3. DROP INITIALS
  // This regex looks for a space followed by a single letter/dot (like " e." or " e")
  // and removes it from the first name.
  firstName = firstName.replace(/\s[a-z]\.?$/g, "").trim();

  // 4. Create Slug (First-Last)
  let slug = `${firstName}-${lastName}`;

  // 5. Final Sanitization
  // Replace spaces/special chars with hyphens, then clean up double hyphens
  slug = slug
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 6. Generate Path
  const finalPath = `/grad-thumbnails/${numericUid}_${slug}.jpg`;

  return finalPath;
}

// --- INITIALIZATION ---
async function init() {
  // Using your specific Sheet ID from main.js
  const sheetId = "1vzSMuzoYv9H40xQmpXCjHALZmx3ALnb9WH-musGAvqo";
  const tabName = "Help Us Find";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;

  try {
    const response = await fetch(url);
    const csvText = await response.text();
    const rows = csvText.split("\n").slice(1);

    allMissingData = rows
      .map((row) => {
        if (!row.trim()) return null;
        // const cols = row
        //   .split(",")
        //   .map((field) => field.replace(/"/g, "").trim());

        // Replace line 80 with this:
        const cols = row
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((field) => field.replace(/^"|"$/g, "").trim());

        const uid = cols[0];
        const firstName = cols[1] || "";
        const lastGrad = cols[2] || "";

        if (!uid || !lastGrad) return null;

        const fullName = `${lastGrad}, ${firstName}`;
        return {
          uid: uid,
          name: fullName,
          firstName: firstName,
          letter: lastGrad.charAt(0).toUpperCase(),
          thumbnail: getThumbnailUrl(fullName, uid),
        };
      })
      .filter((item) => item !== null && item.uid.startsWith("BHS-"));

    filteredClassmates = [...allMissingData];

    // Update UI Counts
    if (totalCount) totalCount.textContent = allMissingData.length;
    if (totalCount2) totalCount2.textContent = allMissingData.length;
    if (showingCount) showingCount.textContent = allMissingData.length;
    // console.log("totalCount2", totalCount2, allMissingData.length);

    generateAlphabetButtons();
    attachEventListeners();
    renderGrid();
  } catch (error) {
    console.error("Dashboard Sync Failed:", error);
  }
}

// --- CORE FUNCTIONS ---

// Render the grid
function renderGrid() {
  // Update count
  if (showingCount) showingCount.textContent = filteredClassmates.length;

  // Clear grid
  classmatesGrid.innerHTML = "";

  // Show/hide no results
  if (filteredClassmates.length === 0) {
    noResults.classList.remove("hidden");
    classmatesGrid.style.display = "none";
  } else {
    noResults.classList.add("hidden");
    classmatesGrid.style.display = "grid";

    // Render cards
    filteredClassmates.forEach((person, index) => {
      const card = createClassmateCard(person, index);
      classmatesGrid.appendChild(card);
    });
  }
}

// Create a classmate card
function createClassmateCard(person, index) {
  const card = document.createElement("div");
  card.className =
    "classmate-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden";

  // Get initials for placeholder
  const initials = getInitials(person.name);

  // THE FIX: src must use ${person.thumbnail} and handle onerror gracefully
  card.innerHTML = `
        <div class="classmate-thumbnail relative aspect-square bg-gray-100">
            <div class="thumbnail-placeholder loading" id="placeholder-${index}">
              ${initials}
            </div>
            <img
                src="${person.thumbnail}"
                alt="${person.name}"
                class="w-full h-full object-cover"
                onload="handleImageLoad(this, ${index})"
                onerror="handleImageError(this, ${index})"
            />
            <div style="z-index: 45" class="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                ${person.uid}
            </div>
            <div class="image-error" id="error-${index}">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
        </div>
            <div class="p-3">
              <h3 class="font-bold text-base text-bhs-green mb-3 text-left leading-tight">${person.name}</h3>
              <div class="flex justify-between gap-2">
                <button class="flex-1 h-7 flex items-center justify-center bg-bhs-gold/20 text-bhs-green rounded border-0 cursor-pointer transition-all hover:bg-bhs-gold/40" onclick="sendEmail('${person.name}')" title="Email Them">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button class="flex-1 h-7 flex items-center justify-center bg-bhs-gold/20 text-bhs-green rounded border-0 cursor-pointer transition-all hover:bg-bhs-gold/40" onclick="sendSMS('${person.name}')" title="Text Them">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button class="flex-1 h-7 flex items-center justify-center bg-bhs-gold/20 text-bhs-green rounded border-0 cursor-pointer transition-all hover:bg-bhs-gold/40" onclick="submitInfo('${person.name}','${person.uid}')" title="Share Their Info">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
    `;
  return card;
}

// Get initials from name (Last, First format)
function getInitials(name) {
  const parts = name.split(", ");
  if (parts.length === 2) {
    // First initial + Last initial
    return parts[1].charAt(0) + parts[0].charAt(0);
  }
  return name.substring(0, 2).toUpperCase();
}

// Handle successful image load
window.handleImageLoad = function (img, index) {
  img.classList.add("loaded");
  const placeholder = document.getElementById(`placeholder-${index}`);
  if (placeholder) {
    placeholder.style.display = "none";
  }
};

// Handle image error
window.handleImageError = function (img, index) {
  console.log(`Image failed for index ${index}`);
  img.classList.add("error");
  img.style.display = "none";
  const placeholder = document.getElementById(`placeholder-${index}`);
  if (placeholder) {
    placeholder.style.display = "none";
  }
  const errorDiv = document.getElementById(`error-${index}`);
  if (errorDiv) {
    errorDiv.classList.add("show");
  }
};

// --- SEARCH & FILTER LOGIC ---

function handleSearch(term) {
  const search = term.toLowerCase().trim();
  filteredClassmates = allMissingData.filter((p) =>
    p.name.toLowerCase().includes(search),
  );
  renderGrid();
}

function filterByLetter(letter) {
  filteredClassmates = allMissingData.filter((p) => p.letter === letter);
  if (searchInput) searchInput.value = "";
  renderGrid();
  scrollToClassmateGrid();
}

// Change grid columns
function changeGridCols(cols) {
  currentGridCols = cols;
  classmatesGrid.className = `classmates-grid grid-cols-${cols}`;
}

function attachEventListeners() {
  if (searchInput) {
    searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
  }

  // Grid view buttons
  const viewButtons = document.querySelectorAll(".btn-view");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cols = parseInt(btn.dataset.cols);
      changeGridCols(cols);

      // Update active state
      viewButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      filteredClassmates = [...allMissingData];
      if (searchInput) searchInput.value = "";
      renderGrid();
      scrollToClassmateGrid();
    });
  }
}

function generateAlphabetButtons() {
  if (!alphabetButtons) return;
  alphabetButtons.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const btn = document.createElement("button");
    btn.className =
      "btn-letter px-3 py-2 bg-gray-100 rounded hover:bg-bhs-gold transition-colors font-bold text-sm";
    btn.textContent = letter;
    btn.onclick = () => filterByLetter(letter);
    alphabetButtons.appendChild(btn);
  });
}

function scrollToClassmateGrid() {
  const navHeight = document.getElementById("sticky-nav").offsetHeight;
  const searchHeight = document.getElementById("search-navbar").offsetHeight;
  const gridPosition = document.getElementById(
    "classmates-grid-container",
  ).offsetTop;
  if (navHeight && searchHeight) {
    window.scrollTo({
      top: gridPosition - (navHeight + searchHeight) - 20, // 20px extra breathing room
      behavior: "smooth",
    });
  }
}

// Start
init();
