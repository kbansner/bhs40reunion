/**
 * BHS '86 Master Directory, Search & Gatekeeper Logic
 */

const CONFIG = {
  SHEET_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xDkTv8aIauGKKuiqZrHiC2RgOw0A4Nw3HnJkYQ3ES5kmbzxXM7mUker_v-WX1rt6rnnBwI6wQvcO/pub?gid=1741366949&single=true&output=csv",
  SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbz-4_TFUdayT9nobqg4RilTTZSSwAobRNa5HRhHO2PyeZIWcIvOfMXWEZe_hBWWKzXz/exec",
};

const themes = {
  yes: { label: "Attending", colors: "bg-green-800 text-white" },
  maybe: {
    label: "Maybe",
    colors: "bg-amber-50 text-amber-700 border-amber-200",
  },
  no: {
    label: "Not Attending",
    colors: "bg-red-50 text-red-700 border-red-200",
  },
  private: {
    label: "Private",
    colors: "bg-purple-100 text-purple-700 border-purple-200",
  },
  missing: {
    label: "Missing",
    colors: "bg-orange-50 text-orange-700 border-orange-200",
  },
  deceased: {
    label: "In Memoriam", // Softened label
    colors: "bg-slate-700 text-slate-50 border-slate-800", // Muted charcoal vs solid black
  },
  not_responded: {
    label: "Not Responded",
    colors: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

let classmates = [];
let rsvpYes = [];
let rsvpMaybe = [];
let rsvpNo = [];
let selectedIndex = -1;
let expandedCardIndex = null;

const placeholderHTML = `
    <div id="search-placeholder-text" class="py-6 px-2">
        <div class="max-w-2xl">
            <h5 class="text-gray-400 font-bold mb-3 uppercase tracking-wider text-xs">A Note on our Data</h5>
            <p class="text-gray-500 text-base leading-relaxed">
                We are working hard to track everyone down, but we aren't 100% certain about all our data.
                Most of this has been <span class="italic">crowd-sourced</span> from classmates like you.
            </p>
            <p class="text-gray-500 text-base mt-4 leading-relaxed">
                If you see a mistake, please accept our apologies and help us correct it!
                And if your photo is missing, please send one to
                <a href="mailto:photos@bhs40.com" class="text-yellow-500 hover:underline font-medium">photos@bhs40.com</a>.
            </p>
        </div>
    </div>`;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  await loadDirectoryData();
  if (document.getElementById("directorySearch")) initSearchLogic();
});

// --- DATA PROCESSING ---
// --- UPDATED DATA PROCESSING FOR NEW COLUMN LAYOUT ---
async function loadDirectoryData() {
  try {
    const response = await fetch(CONFIG.SHEET_URL);
    const text = await response.text();
    const rows = text.split("\n").slice(1);

    ["list-yes", "list-maybe", "list-no"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });

    let countYes = 0,
      countMaybe = 0,
      countNo = 0;

    // 1. Map and Clean Data
    let processedClassmates = rows.map((row) => {
      const cols = row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim());

      // --- CLEANING INITIALS ---
      let firstName = cols[1] || "";
      const lastName = cols[2] || "";
      // Strip space + single letter + optional dot at the end
      firstName = firstName.replace(/\s[a-z]\.?$/gi, "").trim();

      const fullName = `${firstName} ${lastName}`.trim();
      const uid = cols[0] || ""; // Unique ID for de-duplication

      const displayName = cols[12] || fullName;
      const bio = cols[13] || "";
      const lat = cols[14] || null;
      const lng = cols[15] || null;
      const rawStatus = (cols[16] || "not responded").toLowerCase().trim();
      const photoURL = cols[17] || "default.png";

      let status = "not_responded";
      if (rawStatus === "yes" || rawStatus === "attending") status = "yes";
      else if (rawStatus === "maybe") status = "maybe";
      else if (rawStatus === "no") status = "no";
      else if (rawStatus === "private") status = "private";
      else if (rawStatus === "missing") status = "missing";
      else if (rawStatus === "deceased") status = "deceased";

      return {
        uid: uid,
        name: fullName,
        displayName: displayName,
        bio: bio,
        lat: lat,
        lng: lng,
        status: status,
        hometown:
          cols[10] && cols[11] ? `${cols[10]}, ${cols[11]}` : cols[10] || null,
        photo: photoURL.includes("http")
          ? photoURL
          : `/grad-thumbnails/${photoURL}`,
        isPrivate: status === "private",
      };
    });

    // 2. DE-DUPLICATE by UID
    // This ensures that even if a classmate is listed twice, they only appear once.
    classmates = processedClassmates.filter(
      (item, index, self) =>
        item.uid !== "" && index === self.findIndex((t) => t.uid === item.uid),
    );

    // 1. Separate into RSVP categories
    rsvpYes = classmates.filter((p) => p.status === "yes");
    rsvpMaybe = classmates.filter((p) => p.status === "maybe");
    rsvpNo = classmates.filter((p) => p.status === "no");

    // 2. Render the interactive pills for each section
    renderPills("list-yes", rsvpYes);
    renderPills("list-maybe", rsvpMaybe);
    renderPills("list-no", rsvpNo);

    // 3. Render the scrolling bio cards for each section
    renderSectionCards("cards-container-yes", rsvpYes);
    renderSectionCards("cards-container-maybe", rsvpMaybe);
    renderSectionCards("cards-container-no", rsvpNo);

    // Update counts
    updateCountDisplay("count-yes", rsvpYes.length);
    updateCountDisplay("count-maybe", rsvpMaybe.length);
    updateCountDisplay("count-no", rsvpNo.length);
  } catch (e) {
    console.error("Data load failed", e);
  }
}

// --- SEARCH & NAVIGATION ---
function initSearchLogic() {
  const input = document.getElementById("directorySearch");
  const dropdown = document.getElementById("autocompleteDropdown");
  const results = document.getElementById("searchResults");

  input.addEventListener("keydown", function (e) {
    const items = dropdown.querySelectorAll(".dropdown-item");
    const isVisible = !dropdown.classList.contains("hidden");

    if (e.key === "Escape") {
      this.value = "";
      dropdown.classList.add("hidden");
      results.innerHTML = placeholderHTML;
      selectedIndex = -1;
    } else if ((e.key === "ArrowDown" || e.key === "Tab") && isVisible) {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === "ArrowUp" && isVisible) {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === "Enter" && isVisible) {
      e.preventDefault();
      if (selectedIndex > -1) items[selectedIndex].click();
      else if (items.length === 1) items[0].click();
    }
  });

  input.addEventListener("input", function () {
    selectedIndex = -1;
    const term = this.value.toLowerCase().trim();
    if (!term) {
      dropdown.classList.add("hidden");
      results.innerHTML = placeholderHTML;
      return;
    }
    const matches = classmates
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 8);
    if (matches.length > 0) {
      dropdown.innerHTML = matches
        .map(
          (p) => `
        <div class="dropdown-item px-6 py-3 text-gray-800 hover:bg-gray-100 cursor-pointer border-b last:border-0 font-medium text-left"
             onclick="selectPerson('${p.name.replace(/'/g, "\\'")}')">
          ${p.name}
        </div>`,
        )
        .join("");
      dropdown.classList.remove("hidden");
    } else {
      dropdown.classList.add("hidden");
    }
  });
}

function updateHighlight(items) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add("bg-gray-700", "text-white");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("bg-gray-700", "text-white");
    }
  });
}

window.selectPerson = function (name) {
  const p = classmates.find((c) => c.name === name || c.displayName === name);
  if (!p) return;

  document.getElementById("directorySearch").value = p.displayName;
  document.getElementById("autocompleteDropdown").classList.add("hidden");

  const statusKey = p.status.toLowerCase().trim();

  const t = themes[p.status] || themes.not_responded;

  const hometownHTML =
    !p.isPrivate && p.hometown
      ? `<p class="mt-2 text-slate-600"><svg class="inline-block -mt-[3px] w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg> ${p.hometown}</p>`
      : "";

  const bioHTML = p.bio
    ? `<div class="mt-4 pt-4 border-t border-gray-100">
           <p class="text-sm text-slate-500 italic leading-relaxed">"${p.bio}"</p>
         </div>`
    : "";

  const imageStyle =
    statusKey === "deceased"
      ? "sepia-[.4] contrast-[.86] brightness-[1.1]" // Subtle warm vintage feel
      : "";

  document.getElementById("searchResults").innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-3xl mx-auto mt-6 text-left">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="relative">
            <div style="z-index: 10" class="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                ${p.uid}
            </div>
            <img
            onerror="this.onerror=null; this.src='/grad-thumbnails/default.png';"
            src="${p.photo}" class="w-40 h-40 rounded-xl object-cover shadow-md border-4 border-white shrink-0 ${imageStyle}">
          </div>
          <div class="flex-1 w-full">
            <h4 class="text-3xl font-bold text-green-800 mb-2">${p.displayName}</h4>
            <span class="inline-flex px-4 py-1 rounded-full text-sm font-bold border ${t.colors}">${t.label}</span>
            ${hometownHTML}
            ${bioHTML}
          </div>
        </div>
      </div>`;
};

// --- STORAGE ---
function updateCountDisplay(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = `(${count})`;
}

function setCheckInStatus(status) {
  localStorage.setItem(CONFIG.STORAGE_KEY, status ? "true" : "false");
}

function getCheckInStatus() {
  const modernStatus = localStorage.getItem(CONFIG.STORAGE_KEY) === "true";
  const legacyStatus = localStorage.getItem("bhs86_visited") === "true";
  if (legacyStatus && !modernStatus) setCheckInStatus(true);
  return modernStatus || legacyStatus;
}

// Bio Cards below RSVP status pills
//
// Reusable Pill Renderer
function renderPills(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  data.forEach((p) => {
    const pill = document.createElement("div");
    pill.textContent = p.displayName;
    pill.onclick = () => scrollToUID(p.uid);
    container.appendChild(pill);
  });
}

// Reusable Card Section Renderer
function renderSectionCards(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  data.forEach((p) => {
    const card = createCard(p, p.uid); // Pass UID instead of index
    container.appendChild(card);
  });
}

// Updated Scroll Logic using UID
function scrollToUID(uid) {
  const element = document.getElementById(`attendee-${uid}`);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    // Optional: add a highlight flash effect
    element.classList.add("ring-4", "ring-yellow-400");
    setTimeout(
      () => element.classList.remove("ring-4", "ring-yellow-400"),
      2000,
    );
  }
}

// Create a single card
function createCard(attendee, uid) {
  const isExpanded = expandedCardIndex === uid;

  const card = document.createElement("div");
  card.id = `attendee-${uid}`;

  // Changed h-[325px] to max-h and h-fit to prevent white space
  const cardClasses = isExpanded
    ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl z-100 p-6 md:p-8"
    : "w-[300px] md:w-[400px] h-fit min-h-[160px] shadow-lg hover:shadow-xl relative p-6";

  card.className = `${cardClasses} flex-shrink-0 bg-white rounded-lg border-2 border-gray-100 flex flex-col card-transition`;

  if (isExpanded) {
    card.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";

    const closeBtn = document.createElement("button");
    closeBtn.className =
      "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10";
    closeBtn.innerHTML = `
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    closeBtn.onclick = () => collapseCard();
    card.appendChild(closeBtn);
  }

  // Header row
  const header = document.createElement("div");
  header.className = "flex gap-4 items-start mb-4";

  const photoContainer = document.createElement("div");
  photoContainer.className = "flex-shrink-0";

  const photo = document.createElement("img");
  // FIX: Handle missing images by providing a fallback path
  photo.onerror = function () {
    this.src = "/grad-thumbnails/default.png"; // Replace with your actual default path
  };
  photo.src = attendee.photo;
  photo.alt = attendee.name;
  photo.loading = "lazy";
  photo.className =
    "w-20 h-20 rounded-full aspect-square object-cover border-2 border-gray-200";
  photoContainer.appendChild(photo);

  const nameLocation = document.createElement("div");
  nameLocation.className = "flex-1 min-w-0";
  nameLocation.innerHTML = `
    <h3 class="text-xl font-bold text-[#006400] mb-1.5" style="font-family: 'Roboto Slab', serif;">
      ${attendee.displayName}
    </h3>
    <p style="" class="text-sm font-semibold capitalize tracking-wider text-gray-500 ml-0.5">
      <span class="capitalize ${attendee.status.toLowerCase() === "no" ? "text-red-700" : "text-[#006400]"}">
        ${themes[attendee.status.toLowerCase()].label}</span>
    </p>
    <p class="text-sm text-gray-600 flex items-center gap-0.5">
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      ${attendee.hometown}
    </p>
  `;

  header.appendChild(photoContainer);
  header.appendChild(nameLocation);
  card.appendChild(header);

  // Bio text
  const bioContainer = document.createElement("div");
  bioContainer.className = isExpanded
    ? "mb-2 flex-1 overflow-auto"
    : "mb-2 overflow-hidden relative";

  const bioText = document.createElement("p");
  bioText.className = `text-sm text-gray-700 leading-[1.5] ${isExpanded ? "" : "line-clamp-4"}`;
  bioText.textContent = attendee.bio;
  bioContainer.appendChild(bioText);
  card.appendChild(bioContainer);

  // FIX: Only show Read More if the bio is actually long enough to overflow
  if (!isExpanded && attendee.bio) {
    const isLongBio = attendee.bio.length > 180; // Character heuristic to match line-clamp-4

    if (isLongBio) {
      const readMoreContainer = document.createElement("div");
      readMoreContainer.className = "flex justify-end mt-auto pt-2";

      const readMoreBtn = document.createElement("button");
      readMoreBtn.className =
        "text-sm text-[#006400] hover:underline font-medium flex items-center gap-1";
      readMoreBtn.innerHTML = `
        Read More →
      `;
      readMoreBtn.onclick = () => expandCard(uid);

      readMoreContainer.appendChild(readMoreBtn);
      card.appendChild(readMoreContainer);
    }
  }

  return card;
}

// Expand card
function expandCard(uid) {
  expandedCardIndex = uid;
  rerenderCards();
  showBackdrop();
}

// Collapse card
function collapseCard() {
  expandedCardIndex = null;
  rerenderCards();
  hideBackdrop();
}

// Re-render all cards
// Updated Re-render to handle multiple categories
function rerenderCards() {
  // 1. Re-render the scrolling bio cards for all three containers
  renderSectionCards("cards-container-yes", rsvpYes);
  renderSectionCards("cards-container-maybe", rsvpMaybe);
  renderSectionCards("cards-container-no", rsvpNo);

  // 2. Note: We don't need to clear "cardsContainer" because it's replaced by the 3 IDs above
}

// Backdrop functions
function setupBackdropListener() {
  const backdrop = document.getElementById("backdrop");
  backdrop.onclick = collapseCard;
}

function showBackdrop() {
  const backdrop = document.getElementById("backdrop");
  backdrop.classList.remove("hidden");
}

function hideBackdrop() {
  const backdrop = document.getElementById("backdrop");
  backdrop.classList.add("hidden");
}
