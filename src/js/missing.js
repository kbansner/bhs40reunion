/* ===================================
   MISSING CLASSMATES SEARCH TOOL
   Synced with Master Directory Logic & Search Party Modal
   =================================== */

const MISSING_CONFIG = {
  SHEET_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xDkTv8aIauGKKuiqZrHiC2RgOw0A4Nw3HnJkYQ3ES5kmbzxXM7mUker_v-WX1rt6rnnBwI6wQvcO/pub?gid=1741366949&single=true&output=csv",
  FORM_ACTION_URL:
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeUCK2CHwM4sf2Y7YcxJh2EaqiuIWXf2DWIiUBRrGbYeEOxag/formResponse"
};

// --- STATE ---
let allMissingData = [];
let filteredClassmates = [];
let currentGridCols = 5;

// --- DOM ELEMENTS (Base) ---
const searchInput = document.getElementById("search-missing");
const classmatesGrid = document.getElementById("classmates-grid");
const alphabetButtons = document.getElementById("alphabet-buttons");
const showAllBtn = document.getElementById("show-all-btn");
const noResults = document.getElementById("no-results");
const showingCount = document.getElementById("results-count");
const totalCount = document.getElementById("total-count");
const totalCount2 = document.getElementById("total-count-2");

// --- DOM ELEMENTS (Modal) ---
const modal = document.getElementById("classmate-modal");
const closeModal = document.getElementById("close-modal");
const form = document.getElementById("headless-search-form");
const successMsg = document.getElementById("success-message");
const submitBtn = document.getElementById("submit-btn");
const volunteerNameInput = document.getElementById("volunteer-name");

// --- INITIALIZATION ---
async function init() {
  try {
    const response = await fetch(MISSING_CONFIG.SHEET_URL);
    const text = await response.text();
    const rows = text.split("\n").slice(1);

    allMissingData = rows
      .map((row) => {
        const cols = row
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((c) => c.replace(/^"|"$/g, "").trim());

        let firstName = cols[1] || "";
        const lastName = cols[2] || "";

        firstName = firstName.replace(/\s[a-z]\.?$/gi, "").trim();

        const fullName = `${lastName}, ${firstName}`;
        const displayName = cols[12] || `${firstName} ${lastName}`;
        const rawStatus = (cols[16] || "").toLowerCase().trim();
        const photoFileName = cols[17] || "default.png";

        // Grab the number from Column T (index 19)
        const notesCount = parseInt((cols[19] || "").trim(), 10) || 0;

        // NEW - Grab the Batch ID from Column U (index 20)
        const searchBatch = (cols[20] || "").trim().toLowerCase();

        if (rawStatus !== "missing") return null;

        return {
          uid: cols[0] || "N/A",
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          displayName: displayName,
          letter: lastName.charAt(0).toUpperCase(),
          thumbnail: photoFileName.includes("http")
            ? photoFileName
            : `/grad-thumbnails/${photoFileName}`,
          notesCount: notesCount,
          batch: searchBatch // Pass the batch down to the array
        };
      })
      .filter((item) => item !== null);

    // De-duplication
    allMissingData = allMissingData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.uid === item.uid),
    );

    // --- FACEBOOK BATCH URL FILTERING ---
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get('batch');

    if (batchId) {
      // 1. Filter the array
      filteredClassmates = allMissingData.filter(p => p.batch === batchId.toLowerCase());

      // 2. Update the main page title
      const titleEl = document.querySelector("h1");
      if (titleEl) titleEl.textContent = `Find Our Friends Fridays: Week ${batchId}`;

      // 3. Update the Control Box Header & Text
      const controlBox = document.querySelector(".search-section");
      if (controlBox) {
        const boxHeader = controlBox.querySelector(".section-title");
        const boxText = controlBox.querySelector(".section-subtitle");

        if (boxHeader) boxHeader.textContent = `${filteredClassmates.length} Targeted Classmates`;
        if (boxText) boxText.textContent = "Please review this week's focus list. Click on a classmate to leave a note about your search efforts or log any contact information you have discovered.";
      }

      // 4. Hide unnecessary controls
      const searchContainer = document.querySelector(".search-input-wrapper");
      if (searchContainer) searchContainer.style.display = "none";

      const searchCount = document.querySelector(".search-count");
      if (searchCount) searchCount.style.display = "none";

      if (alphabetButtons) alphabetButtons.style.display = "none";

      // 5. Update the "Show All" button to act as an exit button
      if (showAllBtn) {
        showAllBtn.textContent = "Exit Friday Focus List";

        // Add some inline styles or Tailwind classes to make it stand out
        showAllBtn.style.backgroundColor = "#2d5a27"; // bhs-green
        showAllBtn.style.color = "white";
        showAllBtn.style.border = "none";

        showAllBtn.onclick = (e) => {
          e.preventDefault();
          window.location.href = window.location.pathname;
        };
      }

    } else {
      // Normal page load, show everyone
      filteredClassmates = [...allMissingData];
    }

    // Update counts based on the total missing
    const count = allMissingData.length;
    if (totalCount) totalCount.textContent = count;
    if (totalCount2) totalCount2.textContent = count;

    // Finally, render the page
    generateAlphabetButtons();
    attachEventListeners();
    renderGrid();
  } catch (error) {
    console.error("Missing Page Load Failed:", error);
  }
}

// --- CORE FUNCTIONS ---
function renderGrid() {
  if (showingCount) showingCount.textContent = filteredClassmates.length;
  classmatesGrid.innerHTML = "";

  if (filteredClassmates.length === 0) {
    noResults.classList.remove("hidden");
    classmatesGrid.style.display = "none";
  } else {
    noResults.classList.add("hidden");
    classmatesGrid.style.display = "grid";
    filteredClassmates.forEach((person, index) => {
      classmatesGrid.appendChild(createClassmateCard(person, index));
    });
  }
}

function createClassmateCard(person, index) {
  const card = document.createElement("div");

  card.className =
    "classmate-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200";

  card.setAttribute("data-uid", person.uid);
  card.setAttribute("data-name", person.displayName);

  const initials = person.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // 1. Build the badge if there is at least 1 note (Using a clean SVG instead of an emoji)
  const noteIndicator = person.notesCount > 0
    ? `<div style="z-index: 10" class="absolute top-2 left-2 bg-bhs-gold text-white text-[10px] px-2 py-1 rounded shadow-md font-bold flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          ${person.notesCount} Note${person.notesCount > 1 ? 's' : ''}
        </div>`
    : ``;

  // 2. Inject it into the HTML, right inside the thumbnail div
  card.innerHTML = `
    <div class="classmate-thumbnail relative aspect-square bg-gray-100">
        <div class="thumbnail-placeholder loading" id="placeholder-${index}">${initials}</div>
        <img src="${person.thumbnail}"
             alt="${person.displayName}"
             class="w-full h-full object-cover"
             onload="handleImageLoad(this, ${index})"
             onerror="handleImageError(this, ${index})" />

        <!-- NEW: Inject the badge here (Top Left) -->
        ${noteIndicator}

        <div style="z-index: 10" class="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
            ${person.uid}
        </div>
        <div class="image-error" id="error-${index}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
    </div>
    <div class="p-3">
        <h3 class="font-bold text-base text-bhs-green mb-3 text-left leading-tight">${person.displayName}</h3>
        <div class="flex justify-between gap-2">
            <button class="flex-1 h-7 flex items-center justify-center bg-bhs-gold/20 text-bhs-green rounded border-0 cursor-pointer hover:bg-bhs-gold/40" onclick="event.stopPropagation(); sendEmail('${person.displayName}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2"/></svg>
            </button>
            <button class="flex-1 h-7 flex items-center justify-center bg-bhs-gold/20 text-bhs-green rounded border-0 cursor-pointer hover:bg-bhs-gold/40" onclick="event.stopPropagation(); sendSMS('${person.displayName}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-width="2"/></svg>
            </button>
            <button class="flex-1 h-7 flex items-center justify-center bg-bhs-gold/20 text-bhs-green rounded border-0 cursor-pointer hover:bg-bhs-gold/40">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
        </div>
    </div>
  `;
  return card;
}
// --- UTILITIES ---
window.handleImageLoad = function (img, index) {
  img.classList.add("loaded");
  const p = document.getElementById(`placeholder-${index}`);
  if (p) p.style.display = "none";
};

window.handleImageError = function (img, index) {
  img.style.display = "none";
  const e = document.getElementById(`error-${index}`);
  if (e) e.classList.add("show");
};

function handleSearch(term) {
  const search = term.toLowerCase().trim();
  filteredClassmates = allMissingData.filter(
    (p) =>
      p.name.toLowerCase().includes(search) ||
      p.displayName.toLowerCase().includes(search),
  );
  renderGrid();
}

function filterByLetter(letter) {
  filteredClassmates = allMissingData.filter((p) => p.letter === letter);
  if (searchInput) searchInput.value = "";
  renderGrid();
}

function changeGridCols(cols) {
  currentGridCols = cols;
  classmatesGrid.className = `classmates-grid grid-cols-${cols}`;
}

function attachEventListeners() {
  // --- DIRECTORY LISTENERS ---
  if (searchInput) {
    searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        filteredClassmates = [...allMissingData];
        renderGrid();
      }
    });
  }

  const viewButtons = document.querySelectorAll(".btn-view");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cols = parseInt(btn.dataset.cols);
      changeGridCols(cols);
      viewButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      filteredClassmates = [...allMissingData];
      if (searchInput) searchInput.value = "";
      renderGrid();
    });
  }

  // --- MODAL & FORM LISTENERS ---

  // Load saved name from Local Storage
  if (volunteerNameInput) {
    const savedVolunteerName = localStorage.getItem("bhs_volunteer_name");
    if (savedVolunteerName) {
      volunteerNameInput.value = savedVolunteerName;
    }
  }

  // Open Modal via Event Delegation
  document.body.addEventListener("click", function(e) {
    const card = e.target.closest(".classmate-card");
    if (card && modal) {
      const uid = card.getAttribute("data-uid") || "Unknown UID";
      const name = card.getAttribute("data-name") || "Unknown Classmate";

      document.getElementById("modal-display-name").textContent = "Searching for " + name;
      document.getElementById("hidden-uid").value = uid;
      document.getElementById("hidden-name").value = name;

      // Clear previous inputs
      document.getElementById("search-notes").value = "";
      document.getElementById("found-email").value = "";
      document.getElementById("found-phone").value = "";
      document.getElementById("found-social").value = "";
      document.getElementById("found-address").value = "";

      const optOutCheckbox = document.getElementById("opt-out");
      if(optOutCheckbox) optOutCheckbox.checked = false;

      successMsg.style.display = "none";
      submitBtn.style.display = "block";
      submitBtn.textContent = "Submit Update";
      submitBtn.disabled = false;
      modal.style.display = "flex";
    }
  });

  // Close Modal
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      if (volunteerNameInput && volunteerNameInput.value.trim() !== "") {
        localStorage.setItem("bhs_volunteer_name", volunteerNameInput.value.trim());
      }

      submitBtn.textContent = "Saving...";
      submitBtn.disabled = true;

      const formData = new FormData(form);

      fetch(MISSING_CONFIG.FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
      }).then(() => {
        successMsg.style.display = "block";
        submitBtn.style.display = "none";

        setTimeout(() => {
          modal.style.display = "none";
        }, 2500);
      }).catch(error => {
        console.error("Error submitting form:", error);
        alert("Something went wrong saving the data. Please try again.");
        submitBtn.textContent = "Submit Update";
        submitBtn.disabled = false;
      });
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

// Start the application
init();
