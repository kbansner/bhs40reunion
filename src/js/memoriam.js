/**
 * Memoriam Page Logic - BHS '86
 */

const CONFIG = {
  // 1. Keep your CSV for the main Class Registry data
  SHEET_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-xDkTv8aIauGKKuiqZrHiC2RgOw0A4Nw3HnJkYQ3ES5kmbzxXM7mUker_v-WX1rt6rnnBwI6wQvcO/pub?gid=1741366949&single=true&output=csv",

  // 2. Add your Apps Script URL here to fetch the live memories
  SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycby9tAi93Sp82HqCYVSoepqa7NWom2MTL5VdDbONs-KFKXL02rJO16a2hnGXJkKkqOZR/exec",
};

let deceasedClassmates = [];
let memories = []; // Start as empty, will be populated from Apps Script
let currentClassmate = null;

document.addEventListener("DOMContentLoaded", async () => {
  // We load both simultaneously for better performance
  await Promise.all([loadMemoriamData(), loadLiveMemories()]);

  setupFormHandler();
});

/**
 * NEW: FETCH LIVE MEMORIES
 */
async function loadLiveMemories() {
  try {
    const response = await fetch(CONFIG.SCRIPT_URL);
    const data = await response.json();

    // data.memories is the array we created in your updated doGet()
    if (data.memories) {
      memories = data.memories;
      console.log(`Loaded ${memories.length} memories.`);
    }
  } catch (e) {
    console.error("Failed to load live memories from Apps Script", e);
  }
}

/**
 * FETCH & FILTER CLASS REGISTRY (Updated to handle fetch)
 */
async function loadMemoriamData() {
  try {
    const response = await fetch(CONFIG.SHEET_URL);
    const text = await response.text();
    const rows = text.split("\n").slice(1);

    const allData = rows.map((row) => {
      const cols = row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim());

      const firstName = (cols[1] || "").replace(/\s[a-z]\.?$/gi, "").trim();
      const lastName = cols[2] || "";
      const status = (cols[16] || "").toLowerCase().trim();
      const photoURL = cols[17] || "default.png";

      return {
        uid: cols[0] || "",
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        bio: cols[13] || "",
        status: status,
        photoUrl: photoURL.includes("http")
          ? photoURL
          : `/grad-thumbnails/${photoURL}`,
      };
    });

    deceasedClassmates = allData.filter((p) => p.status === "deceased");
    renderClassmatesGrid();
  } catch (e) {
    console.error("Failed to load Class Registry", e);
  }
}

/**
 * RENDER GRID
 */
function renderClassmatesGrid() {
  const grid = document.getElementById("classmates-grid");
  if (!grid) return;
  grid.innerHTML = "";

  deceasedClassmates.forEach((person) => {
    const card = document.createElement("div");
    card.className =
      "group cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-all";
    card.onclick = () => openModal(person);

    // Keep the layout utilities in Tailwind, use the custom class for the 'look'
    const imgClass =
      "absolute inset-0 w-full h-full object-cover object-top z-10 sepia-person";

    card.innerHTML = `
      <div class="aspect-[4/5] bg-muted relative overflow-hidden">

            <div class="absolute inset-0 flex items-center justify-center opacity-30 z-0">
                <svg class="h-24 w-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
                </svg>
            </div>

            <img src="${person.photoUrl}"
                 onerror="this.remove();"
                 alt="${person.fullName}"
                 class="${imgClass}">

          </div>
      <div class="p-4 text-center">
          <h3 class="font-serif font-medium text-lg">${person.fullName}</h3>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * MODAL LOGIC
 */
function openModal(person) {
  currentClassmate = person;
  const modal = document.getElementById("modal");

  document.getElementById("modal-name").textContent = person.fullName;
  document.getElementById("modal-bio").textContent =
    person.bio || "No biography available.";

  const photoContainer = document.getElementById("modal-photo");

  photoContainer.innerHTML = `
      <div class="absolute inset-0 flex items-center justify-center opacity-30 z-0">
          <svg class="h-24 w-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
          </svg>
      </div>

      <img src="${person.photoUrl}"
           onerror="this.remove();"
           alt="${person.fullName}"
           class="absolute inset-0 block w-full h-full object-cover object-top z-10 sepia-[.4] contrast-[.86] brightness-[1.1]">
  `;

  // Render associated memories (currently filtered from your local MEMORIES array)
  renderMemories(person.uid);

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Close modal
window.closeModal = () => {
  const modal = document.getElementById("modal");
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
  currentClassmate = null;

  // Reset form
  document.getElementById("memory-form").reset();
};

// Render memories for a classmate
function renderMemories(uid) {
  const memoriesList = document.getElementById("memories-list");
  const classmateMemories = memories.filter((m) => m.uid === uid);

  if (classmateMemories.length === 0) {
    memoriesList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <p class="text-muted-foreground mb-2">
                    No memories shared for ${currentClassmate.firstName} yet.
                </p>
                <p class="text-muted-foreground">
                    Would you like to be the first?
                </p>
            </div>
        `;
    return;
  }

  memoriesList.innerHTML =
    '<div class="space-y-6">' +
    classmateMemories
      .map(
        (memory) => `
        <div class="space-y-2">
            <div class="flex items-baseline gap-2">
                <p class="font-medium">${memory.contributorName}</p>
                <span class="text-muted-foreground">·</span>
                <p class="text-muted-foreground text-sm">${memory.relationship}</p>
            </div>
            <p class="text-foreground/90 leading-relaxed">
                ${memory.memoryText}
            </p>
            <div class="border-t border-border mt-6"></div>
        </div>
    `,
      )
      .join("") +
    "</div>";
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById("memory-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentClassmate || !currentClassmate.uid) {
      console.error("No classmate selected for memory submission.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const contributorName = document.getElementById("contributor-name").value;
    const relationship = document.getElementById("relationship").value;
    const memoryText = document.getElementById("memory-text").value;

    const newMemory = {
      id: `M${Date.now()}`,
      uid: currentClassmate.uid,
      contributorName,
      relationship,
      memoryText,
      timestamp: new Date().toISOString(),
    };

    // 1. UI Feedback
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      // 2. Send to Google Apps Script
      await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Required for Google Apps Script redirects
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemory),
      });

      // 3. Update UI Optimistically
      // Use unshift to put the newest memory at the top of the list
      memories.unshift(newMemory);

      // 4. Refresh the display
      renderMemories(currentClassmate.uid);

      form.reset();
      // alert("Thank you for sharing your memory.");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post Memory";
    }
  });
}

// Scroll to top
window.scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Close modal on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
