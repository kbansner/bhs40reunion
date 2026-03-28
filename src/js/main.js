// Sticky Navigation - Show/Hide on Scroll
(function () {
  const stickyNav = document.getElementById("sticky-nav");
  let lastScrollY = window.scrollY;

  function handleScroll() {
    const currentScrollY = window.scrollY;

    // Show sticky nav after scrolling 300px
    if (currentScrollY > 300) {
      stickyNav.classList.add("visible");
    } else {
      stickyNav.classList.remove("visible");
    }

    lastScrollY = currentScrollY;
  }

  // Throttle scroll event for performance
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// Update share links with current URL (runs after page load)
window.addEventListener("DOMContentLoaded", function () {
  const currentUrl = encodeURIComponent(window.location.href);
  const shareMessage = encodeURIComponent(
    "Check out the Berkeley High Class of '86 40th Reunion! Help us make it happen: ",
  );

  // Update email link
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    emailLink.href = `mailto:?subject=BHS Class of '86 Reunion&body=${shareMessage}${currentUrl}`;
  }

  // Update SMS link
  const smsLink = document.querySelector('a[href^="sms:"]');
  if (smsLink) {
    smsLink.href = `sms:?&body=${shareMessage}${currentUrl}`;
  }

  // Update Facebook link
  const fbLink = document.querySelector('a[href*="facebook.com/sharer"]');
  if (fbLink) {
    fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
  }
});

// src/main.js
//
import "./jquery-global.js"; // Vite pulls the code in right here
import { loadPins } from "./map-logic.js"; // We'll put the heavy lifting here

window.initMap = function () {
  // 1. Create the Map instance
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 42.5584, lng: -71.2689 }, // Billerica area
    zoomControl: true, // This forces the +/- buttons to show
    zoom: 6,
    mapId: "BHS_MAP_ID", // Optional: for custom styling
  });

  // 2. Start loading the pins from your Google Sheet
  loadPins(map);
};

// ============================================
// HELP US FIND SECTION - Search & Contact Functions
// ============================================
async function fetchClassmatesFromSheet() {
  const sheetId = "1vzSMuzoYv9H40xQmpXCjHALZmx3ALnb9WH-musGAvqo";
  const tabName = "Help Us Find";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;

  try {
    const response = await fetch(url);
    const csvText = await response.text();
    const rows = csvText.split("\n").slice(1);

    const rawList = rows
      .map((row) => {
        // 1. Skip completely empty rows
        if (!row.trim()) return null;

        const cols = row
          .split(",")
          .map((field) => field.replace(/"/g, "").trim());

        const uid = cols[0];
        const firstName = cols[1] || "";
        const lastGrad = cols[2] || "";
        const lastNow = cols[3] || "";

        // 2. Safety check: If there's no UID or no last name, skip this row
        if (!uid || (!lastGrad && !lastNow)) return null;

        let displayName;
        if (lastNow) {
          displayName = `${lastNow} (${lastGrad}), ${firstName}`;
        } else {
          displayName = `${lastGrad}, ${firstName}`;
        }

        // 3. Safety check for the sort letter
        const sortBase = lastNow || lastGrad;
        const sortLetter = sortBase ? sortBase.charAt(0).toUpperCase() : "?";

        return { name: displayName, uid: uid, sortLetter: sortLetter };
      })
      .filter((item) => item !== null && item.uid.startsWith("BHS-"));

    // Grouping
    const grouped = rawList.reduce((acc, person) => {
      const letter = person.sortLetter;
      if (!acc[letter]) acc[letter] = { letter: letter, names: [] };
      acc[letter].names.push({ name: person.name, uid: person.uid });
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => a.letter.localeCompare(b.letter))
      .map((group) => ({
        ...group,
        names: group.names.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

// --- INITIALIZATION LOGIC ---
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Fetch and render Missing Classmates
  const missingClassmatesData = await fetchClassmatesFromSheet();
  renderMissingClassmates(missingClassmatesData);
  initMissingClassmatesSearch();

  // 2. Fetch and render Dashboard Stats & Chart
  // We call it here instead of using window.onload
  fetchReunionStats();
});

// Render all missing classmates dynamically
function renderMissingClassmates(missingClassmatesData) {
  const container = document.getElementById("missing-classmates-container");
  const alphabetNav = document.querySelector(
    ".flex.flex-wrap.justify-center.gap-2.mb-8",
  );

  if (!container) return; // Section might not exist on page

  // Clear existing content
  container.innerHTML = "";

  // Build alphabet navigation
  if (alphabetNav) {
    alphabetNav.innerHTML = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphabet.forEach((letter) => {
      const link = document.createElement("a");
      link.href = `#letter-${letter}`;
      link.className =
        "alphabet-link px-3 py-2 bg-bhs-green text-white rounded-md hover:bg-bhs-green/90 transition-colors font-semibold text-sm";
      link.textContent = letter;
      alphabetNav.appendChild(link);
    });
  }

  // Render each letter section
  missingClassmatesData.forEach((section) => {
    if (section.names.length === 0) return; // Skip empty sections

    const sectionDiv = document.createElement("div");
    sectionDiv.className = "letter-section mb-8";
    sectionDiv.setAttribute("data-letter", section.letter);
    sectionDiv.id = `letter-${section.letter}`;

    const heading = document.createElement("h3");
    heading.className =
      "text-2xl font-bold text-bhs-green heading-font mb-4 pb-2 border-b-2 border-bhs-gold";
    heading.textContent = section.letter;
    sectionDiv.appendChild(heading);

    const grid = document.createElement("div");
    grid.className =
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3";

    section.names.forEach((name) => {
      const card = createClassmateCard(name);
      grid.appendChild(card);
    });

    sectionDiv.appendChild(grid);
    container.appendChild(sectionDiv);
  });

  // Update total count
  const totalCount = missingClassmatesData.reduce(
    (sum, section) => sum + section.names.length,
    0,
  );
  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    resultsCount.textContent = totalCount;
  }
}

// Create a single classmate card
function createClassmateCard(classmateData) {
  const card = document.createElement("div");
  card.className =
    "classmate-card bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow";
  card.setAttribute("data-name", classmateData.name);

  const nameHeading = document.createElement("h4");
  nameHeading.className = "font-semibold text-base text-bhs-green mb-2";
  nameHeading.textContent = classmateData.name;
  card.appendChild(nameHeading);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "flex gap-1.5 justify-center";

  // Email button (icon only)
  const emailBtn = document.createElement("button");
  emailBtn.onclick = () => sendEmail(classmateData.name);
  emailBtn.className =
    "flex items-center justify-center p-2 bg-bhs-gold/20 text-bhs-green rounded-md hover:bg-bhs-gold/40 transition-all";
  emailBtn.title = "Email Them";
  emailBtn.setAttribute("aria-label", "Email Them");
  emailBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>`;
  emailBtn.addEventListener("click", function () {
    // Send the event to Google Analytics
    gtag("event", "button_click", {
      button_name: "Email Them",
      link_text: emailBtn.innerText,
    });
  });
  buttonContainer.appendChild(emailBtn);

  // SMS button (icon only)
  const smsBtn = document.createElement("button");
  smsBtn.onclick = () => sendSMS(classmateData.name);
  smsBtn.className =
    "flex items-center justify-center p-2 bg-bhs-green/10 text-bhs-green rounded-md hover:bg-bhs-green/20 transition-all";
  smsBtn.title = "Text Them";
  smsBtn.setAttribute("aria-label", "Text Them");
  smsBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>`;
  smsBtn.addEventListener("click", function () {
    // Send the event to Google Analytics
    gtag("event", "button_click", {
      button_name: "Text Them",
      link_text: smsBtn.innerText,
    });
  });
  buttonContainer.appendChild(smsBtn);

  // Share info link (icon only) - NOW WITH UID!
  const shareLink = document.createElement("a");
  shareLink.href = `https://docs.google.com/forms/d/e/1FAIpQLSeUCK2CHwM4sf2Y7YcxJh2EaqiuIWXf2DWIiUBRrGbYeEOxag/viewform?usp=pp_url&entry.1936296006=${classmateData.name}&entry.1741703138=${classmateData.uid}`;
  shareLink.target = "_blank";
  shareLink.rel = "noopener noreferrer";
  shareLink.className =
    "flex items-center justify-center p-2 bg-bhs-red/10 text-bhs-red rounded-md hover:bg-bhs-red/20 transition-all";
  shareLink.title = "Share Their Info";
  shareLink.setAttribute("aria-label", "Share Their Info");
  shareLink.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>`;
  shareLink.addEventListener("click", function () {
    // Send the event to Google Analytics
    gtag("event", "button_click", {
      link_name: "Share Their Info",
      link_url: shareLink.href,
    });
  });
  buttonContainer.appendChild(shareLink);

  card.appendChild(buttonContainer);
  return card;
}

// Search functionality for missing classmates
function initMissingClassmatesSearch() {
  const searchInput = document.getElementById("search-missing");
  if (!searchInput) return; // Section might not exist on page

  const resultsCount = document.getElementById("results-count");
  const noResults = document.getElementById("no-results");
  const classmateCards = document.querySelectorAll(".classmate-card");
  const letterSections = document.querySelectorAll(".letter-section");

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    // If search is empty, show all
    if (searchTerm === "") {
      classmateCards.forEach((card) => {
        card.style.display = "";
      });
      letterSections.forEach((section) => {
        section.style.display = "";
      });
      resultsCount.textContent = classmateCards.length;
      noResults.classList.add("hidden");
      return;
    }

    // Search and filter
    classmateCards.forEach((card) => {
      const name = card.getAttribute("data-name").toLowerCase();
      if (name.includes(searchTerm)) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Hide letter sections that have no visible cards
    letterSections.forEach((section) => {
      const visibleCardsInSection = section.querySelectorAll(
        '.classmate-card:not([style*="display: none"])',
      );
      if (visibleCardsInSection.length === 0) {
        section.style.display = "none";
      } else {
        section.style.display = "";
      }
    });

    // Update count and show/hide no results message
    resultsCount.textContent = visibleCount;
    if (visibleCount === 0) {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");
    }
  });
}

// Email function for missing classmates
function sendEmail(name) {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7"; // Replace with actual form URL
  const subject = encodeURIComponent(
    "BHS Class of '86 Reunion - We're Looking for You!",
  );
  const body = encodeURIComponent(
    `Hi ${name.split(",")[1] ? name.split(",")[1].trim() : name},\n\n` +
      `The Berkeley High School Class of 1986 is planning our 40th reunion for October 2026!\n\n` +
      `We'd love to have you join us. Please fill out this quick questionnaire so we can keep you in the loop:\n` +
      `${questionnaireUrl}\n\n` +
      `Hope to see you there!\n\n` +
      `- BHS Class of '86 Reunion Committee`,
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// SMS function for missing classmates
function sendSMS(name) {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7"; // Replace with actual form URL
  const firstName = name.split(",")[1] ? name.split(",")[1].trim() : name;
  const message = encodeURIComponent(
    `Hi ${firstName}! BHS Class of '86 here. We're planning our 40th reunion (Oct 2026) and would love to have you join! ` +
      `Fill out our quick questionnaire: ${questionnaireUrl}`,
  );

  window.location.href = `sms:?&body=${message}`;
}

async function fetchReunionStats() {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzjyvO6nipB3IwyNapX-_j8ejzoCrXkjC3xus5ynmbs0S2K9s3PptH0iCo1lq9nWhQr/exec";

  const skeleton = document.getElementById("chart-skeleton");
  const chartCanvas = document.getElementById("momentumChart");
  const syncTimestamp = document.getElementById("sync-timestamp");

  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const stats = await response.json();

    // 1. Update the Countdown Card
    document.getElementById("countdown-display").innerText =
      stats.daysRemaining;

    // 2. Update the Progress Bar Card
    const rsvpCount = stats.rsvps;
    const goal = stats.goal;
    const pct = stats.percentage * 100;

    document.getElementById("rsvp-label").innerText = `${rsvpCount} RSVPs`;
    document.getElementById("goal-label").innerText = `Goal: ${goal}`;
    document.getElementById("progress-bar-fill").style.width = `${pct}%`;

    // 3. Update the Engagement Cards
    document.getElementById("percent-display").innerText = `${pct.toFixed(1)}%`;
    document.getElementById("percent-reachable").innerText =
      `${pct.toFixed(1)}%`;

    // 4. Update Timestamp
    if (syncTimestamp && stats.lastUpdated) {
      syncTimestamp.innerText = `Synced at ${stats.lastUpdated}`;
    }

    // 5. Build the Momentum Chart
    const ctx = chartCanvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: stats.weeklyTrends.map((t) => `Week ${t.week}`),
        datasets: [
          {
            data: stats.weeklyTrends.map((t) => t.count),
            backgroundColor: stats.weeklyTrends.map((_, i) =>
              i === stats.weeklyTrends.length - 1 ? "#2e7d32" : "#741b47",
            ),
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f0f0f0" } },
          x: { grid: { display: false } },
        },
      },
    }); // <--- This was missing!

    // 6. Smooth transition: Show chart, hide skeleton
    chartCanvas.classList.add("chart-loaded");
    if (skeleton) {
      skeleton.style.opacity = "0";
      setTimeout(() => {
        skeleton.style.display = "none";
      }, 100);
    }
  } catch (error) {
    console.error("Dashboard Sync Failed:", error);

    // UI Fail-Safe: Show retry button if things go south
    if (skeleton) {
      skeleton.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full text-gray-500 p-4 text-center">
          <p class="mb-2 font-semibold">Connection timed out.</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-bhs-gold text-bhs-green rounded-md font-bold hover:bg-yellow-500 transition-colors">
            Retry Sync
          </button>
        </div>
      `;
      skeleton.classList.remove("loading-pulse");
    }
  }
}
