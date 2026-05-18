import "./jquery-global.js";
import { loadPins } from "./map-logic.js";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz-4_TFUdayT9nobqg4RilTTZSSwAobRNa5HRhHO2PyeZIWcIvOfMXWEZe_hBWWKzXz/exec";

// --- 0. THE GOOGLE MAPS FIX ---
// We attach this to 'window' so the Google API can see it from index.html
window.initMap = function () {
  console.log("Google Maps API is calling initMap...");
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.warn("Map element not found on this page.");
    return;
  }

  const map = new google.maps.Map(mapElement, {
    center: { lat: 37.8715, lng: -122.273 }, // Berkeley High
    zoom: 12,
    mapId: "BHS_REUNION_MAP", // Use your actual Map ID if you have one
    zoomControl: true, // Ensure this is true
    mapTypeControl: false, // Keeps it clean
    streetViewControl: false, // Optional: Hide the little yellow man
    fullscreenControl: true, // Good for mobile users
  });

  // Now that the map is ready, trigger the pins from your other file
  loadPins(map);
};

window.addEventListener("DOMContentLoaded", function () {
  // Update share links with current URL (runs after page load)
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

// Email function for missing classmates
window.sendEmail = (name) => {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7";
  const subject = encodeURIComponent(
    "BHS Class of '86 Reunion - We're Looking for You!",
  );
  const body = encodeURIComponent(
    `Hi ${name.split(",")[1] ? name.split(",")[1].trim() : name},\n\n` +
      `The Berkeley High School Class of 1986 is planning our 40th reunion for October 2026!\n\n` +
      `We'd love to have you join us. Please check-in with this quick questionnaire so we can keep you in the loop:\n` +
      `  ${questionnaireUrl}\n\n` +
      `Hope to see you there!\n\n` +
      `- BHS Class of '86 Reunion Committee\n` +
      `  bhs40reunion.com`,
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

// SMS function for missing classmates
window.sendSMS = (name) => {
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7"; // Replace with actual form URL
  const firstName = name.split(",")[1] ? name.split(",")[1].trim() : name;
  const message = encodeURIComponent(
    `Hi ${firstName}! BHS Class of '86 here. We're planning our 40th reunion (Oct 2026) and would love to have you join! ` +
      `Fill out our quick questionnaire: ${questionnaireUrl} ` +
      `or visit our website: bhs40reunion.com/`,
  );

  window.location.href = `sms:?&body=${message}`;
};

window.submitInfo = function (name, uid) {
  const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSeUCK2CHwM4sf2Y7YcxJh2EaqiuIWXf2DWIiUBRrGbYeEOxag/viewform?usp=pp_url&entry.1936296006=${name}&entry.1741703138=${uid}`;
  window.open(formUrl, "_blank");
};

window.fetchReunionStats = async function () {
  const chartCanvas = document.getElementById("momentumChart");
  if (!chartCanvas) return; // Exit early if the chart isn't on this page

  const skeleton = document.getElementById("chart-skeleton");
  const syncTimestamp = document.getElementById("sync-timestamp");
  const chartTitle = document.querySelector("#momentum-section h2");
  const missingCountDisplay = document.querySelectorAll(
    ".missing-count-display",
  );
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const stats = await response.json();

    // 1. Get the "351" number (Missing Jackets / No Email)
    // Adjust 'stats.missingJackets' to match your exact JSON property name
    const missingJacketsCount = stats.missingJackets || 351;
    if (missingCountDisplay) {
      missingCountDisplay.forEach((el) => {
        el.innerText = missingJacketsCount;
      });
    }

    // 2. Update the Global UI Cards
    document.getElementById("countdown-display").innerText =
      stats.daysRemaining;
    const rsvpCount = stats.rsvps;
    const goal = stats.goal;
    const pct = stats.percentage * 100;

    document.getElementById("rsvp-label").innerText = `${rsvpCount} RSVPs`;
    document.getElementById("goal-label").innerText = `Headcount Goal ${goal}`;
    document.getElementById("progress-bar-fill").style.width = `${pct}%`;
    // document.getElementById("percent-display").innerText = `${pct.toFixed(1)}%`;
    // 1. Select all elements with the class
    const percentElements = document.querySelectorAll(".percent-reachable");

    // 2. Loop through each one and update its content
    percentElements.forEach((el) => {
      el.innerText = `${pct.toFixed(1)}%`;
    });

    if (syncTimestamp && stats.lastUpdated) {
      syncTimestamp.innerText = `Synced at ${stats.lastUpdated}`;
    }

    // 3. Success State Check (25/week target)
    const trendData = stats.weeklyTrends;
    const latestCount = trendData[trendData.length - 1].count;
    const target = 25;

    if (latestCount >= target && chartTitle) {
      chartTitle.classList.remove("text-bhs-green");
      chartTitle.classList.add("text-green-600");
      if (!chartTitle.innerText.includes("🎉")) chartTitle.innerText += " 🎉";
    }

    // 4. Build the Momentum Chart
    // Inside fetchReunionStats, near step 4:
    if (typeof Chart !== "undefined") {
      const ctx = chartCanvas.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: trendData.map((t) => `Week ${t.week}`),
          datasets: [
            {
              label: "Actual Check-ins",
              data: trendData.map((t) => t.count),
              backgroundColor: trendData.map((t, i) => {
                if (i === trendData.length - 1) {
                  return t.count >= target ? "#16a34a" : "#2D5A27";
                }
                return "#741b47";
              }),
              borderRadius: 6,
              order: 2,
            },
            {
              label: "Weekly Target",
              data: new Array(trendData.length).fill(target),
              type: "line",
              borderColor: "#cbd5e1",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
              borderWidth: 2,
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#f8fafc" },
              suggestedMax: 35,
            },
            x: { grid: { display: false } },
          },
        },
      });
    } else {
      console.warn("Chart.js not loaded yet. Retrying in 500ms...");
      // Chart logic
      if (typeof Chart !== "undefined") {
        renderChart(chartCanvas, stats);
      } else if (chartRetryCount < 3) {
        chartRetryCount++;
        setTimeout(window.fetchReunionStats, 1000);
      }
    }

    // 5. Transition UI
    chartCanvas.classList.add("chart-loaded");
    if (skeleton) {
      skeleton.style.opacity = "0";
      setTimeout(() => {
        skeleton.style.display = "none";
      }, 100);
    }
  } catch (error) {
    console.error("Dashboard Sync Failed:", error);
    if (skeleton) {
      skeleton.innerHTML = `<div class="p-4 text-center">Sync Failed. <button onclick="location.reload()">Retry</button></div>`;
    }
  }
};

// Sticky navigation scroll handler
function handleScroll() {
  // Search bar sticks ONLY when it would disappear under the sticky nav
  const stickyNavHeight = 64; // Height of the sticky nav bar

  const stickyNav = document.getElementById("sticky-nav");
  if (stickyNav) {
    // Sticky nav appears at 300px
    if (window.scrollY > 300) {
      stickyNav.classList.remove("-translate-y-full", "opacity-0");
      stickyNav.classList.add("translate-y-0", "opacity-100");
    } else {
      stickyNav.classList.add("-translate-y-full", "opacity-0");
      stickyNav.classList.remove("translate-y-0", "opacity-100");
    }
  }
}

// Sticky Navigation - Show/Hide on Scroll
(function () {
  const stickyNav = document.getElementById("sticky-nav");
  let lastScrollY = window.scrollY;

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

document.addEventListener("DOMContentLoaded", async () => {
  const wall = document.getElementById("note-wall");
  if (!wall) return;

  // Define the Observer first so it's available
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".absolute").forEach((note) => {
            setTimeout(
              () => {
                note.style.top = `${note.dataset.targetTop}%`;
                note.style.opacity = "1";
                note.style.transform = `rotate(${note.dataset.rotation}deg) scale(1)`;
              },
              parseInt(note.dataset.delay) || 0,
            );
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  try {
    const response = await fetch(SCRIPT_URL);

    // Check if response is actually JSON
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    // 1. ALWAYS ADD THE BLANK TRIGGER FIRST
    // Filter for ONLY Song Requests and Suggestions for the Request Line
    const liveNotes = (data.notes || []).filter(
      (note) =>
        note.type === "neon-pink" ||
        note.type === "scrap" ||
        note.type === "post-it",
    );

    // 1. ALWAYS ADD THE BLANK TRIGGER FIRST
    // const addMemoryTrigger = { type: "blank", text: "+" };
    const addMemoryTrigger = { type: "blank", text: "Add Your Request!" };
    liveNotes.push(addMemoryTrigger);

    liveNotes.forEach((note, index) => {
      const div = createNoteElement(note);

      // Placement Math
      const isLeft = index % 2 === 0;
      const left =
        note.type === "blank"
          ? 80
          : isLeft
            ? Math.floor(Math.random() * 15) + 5
            : Math.floor(Math.random() * 15) + 65;
      const top =
        note.type === "blank" ? 75 : Math.floor(Math.random() * 60) + 10;
      const rotation = Math.floor(Math.random() * 20) - 10;

      div.dataset.targetTop = top;
      div.dataset.rotation = rotation;
      div.dataset.delay = index * 100;

      Object.assign(div.style, {
        top: `${top + 15}%`,
        left: `${left}%`,
        opacity: "0",
        transform: `rotate(${rotation + 10}deg) scale(0.5)`,
        transition:
          "opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: note.type === "blank" ? "50" : "10",
      });

      wall.appendChild(div);
      addDragLogic(div, wall, note);
    });

    observer.observe(wall);
  } catch (error) {
    console.error("Failed to load notes:", error);
    // Fallback: If sheet fails, at least show the Add button
    spawnNewNote({ type: "blank", text: "+" });
  }
});

function getNoteStyles(note) {
  const base =
    "absolute pointer-events-auto cursor-pointer transition-all duration-300 transform hover:z-50 hover:scale-110 hover:rotate-0 p-3 shadow-lg hover:shadow-2xl flex flex-col items-start ";

  switch (note.type) {
    case "post-it": // Fixed the backtick here
      return base + "bg-yellow-200 w-48 h-48 text-slate-800 shadow-md";

    case "neon-pink":
      return base + "bg-pink-400 w-48 h-48 text-white font-bold shadow-md";

    case "scrap":
      if (note.variant === "legal") {
        // The Long Yellow Legal Pad
        return (
          base +
          "bg-yellow-100 border-t-8 border-yellow-400 w-72 min-h-[350px] bg-[linear-gradient(#94d2ff_1px,transparent_1px)] bg-[size:100%_1.2rem] text-[15px] leading-[1.2rem] text-slate-800"
        );
      }
      // The Short White Scrap (Red or Blue margin)
      return (
        base +
        "bg-white border-l-4 border-red-400 w-64 min-h-[160px] shadow-sm text-slate-800"
      );

    case "blank":
      return (
        base +
        "bg-white/10 border-2 border-dashed border-white/30 w-48 h-48 items-center justify-center text-white/50"
      );

    default:
      return base + "bg-white w-52 h-52 text-slate-800";
  }
}

const modal = document.getElementById("note-modal");

function openNoteModal() {
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.remove("opacity-0"), 10);
}

function closeNoteModal() {
  modal.classList.add("opacity-0");
  setTimeout(() => modal.classList.add("hidden"), 300);
  document.getElementById("note-input").value = "";
  document.getElementById("author-input").value = "";
}

document
  .getElementById("close-modal")
  .addEventListener("click", closeNoteModal);

let selectedType = "song";

window.setNoteType = function (type) {
  // Attach to window
  selectedType = type;
  const songBtn = document.getElementById("btn-song");
  const suggBtn = document.getElementById("btn-suggestion");

  if (type === "song") {
    songBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-blue-400 bg-blue-50 text-blue-700 text-sm font-bold";
    suggBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-slate-300 text-slate-500 text-sm";
  } else {
    suggBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-yellow-500 bg-yellow-50 text-yellow-700 text-sm font-bold";
    songBtn.className =
      "type-btn px-4 py-1 rounded-full border-2 border-slate-300 text-slate-500 text-sm";
  }
};

const noteForm = document.getElementById("note-form");

// Only attach if the element actually exists on this page
if (noteForm) {
  noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("note-input").value.trim();
    const author = document.getElementById("author-input").value.trim();
    if (!text) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Pinning...";
    submitBtn.disabled = true;

    // Determine if it's a song request or a general suggestion
    let noteType;
    let variant = null;

    if (selectedType === "song") {
      noteType = "neon-pink";
      // Songs usually stay on neon squares unless they are weirdly long
      variant = text.length > 100 ? "legal" : null;
    } else {
      // REUNION IDEAS:
      if (text.length < 40) {
        // Very short? Use the yellow square
        noteType = "post-it";
      } else if (text.length >= 40 && text.length <= 100) {
        // Medium? Use the short white scrap (red line on left)
        noteType = "scrap";
        variant = null; // No legal variant means short scrap
      } else {
        // Long? Use the yellow legal pad (yellow line on top)
        noteType = "scrap";
        variant = "legal";
      }
    }

    const newNote = { text, author, type: noteType, variant };

    try {
      // SEND TO GOOGLE SHEETS
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Required for Apps Script POST
        body: JSON.stringify(newNote),
      });

      // Visual feedback
      spawnNewNote(newNote);
      submitBtn.innerText = "Pinned!";

      setTimeout(() => {
        closeNoteModal();
        submitBtn.innerText = "Pin it!";
        submitBtn.disabled = false;
        noteForm.reset();
      }, 1000);
    } catch (err) {
      console.error("Save failed:", err);
      submitBtn.innerText = "Error!";
      submitBtn.disabled = false;
    }
  });
}

function spawnNewNote(noteData) {
  const wall = document.getElementById("note-wall");
  const div = createNoteElement(noteData); // Use the unified creator

  const left = Math.floor(Math.random() * 30) + 35;
  const top = Math.floor(Math.random() * 30) + 25;
  const rotation = Math.floor(Math.random() * 20) - 10;

  Object.assign(div.style, {
    left: `${left}%`,
    top: `${top + 15}%`,
    opacity: "0",
    transform: `rotate(${rotation + 15}deg) scale(0.5)`,
    transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
    zIndex: "100",
  });

  wall.appendChild(div);
  addDragLogic(div, wall, noteData);

  // Force reflow for animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      div.style.top = `${top}%`;
      div.style.opacity = "1";
      div.style.transform = `rotate(${rotation}deg) scale(1)`;
    });
  });
}

function addDragLogic(div, wall, note) {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  div.addEventListener("mousedown", (e) => {
    // 1. Safety check for the "Add Memory" note
    if (note && note.type === "blank") {
      openNoteModal();
      return;
    }

    // 2. Setup Drag
    isDragging = true;
    div.style.cursor = "grabbing";
    div.style.transition = "none";

    // Shuffle Z-index
    wall.querySelectorAll(".absolute").forEach((n) => (n.style.zIndex = "10"));
    div.style.zIndex = "40";

    startX = e.clientX;
    startY = e.clientY;
    initialLeft = div.offsetLeft;
    initialTop = div.offsetTop;

    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const wallRect = wall.getBoundingClientRect();

    const newLeftPct = ((initialLeft + deltaX) / wallRect.width) * 100;
    const newTopPct = ((initialTop + deltaY) / wallRect.height) * 100;

    div.style.left = `${newLeftPct}%`;
    div.style.top = `${newTopPct}%`;
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    div.style.cursor = "grab";
    div.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
  });
}

function createNoteElement(note) {
  const div = document.createElement("div");
  div.className = getNoteStyles(note);

  div.innerHTML = `
    <div class="h-full w-full flex flex-col p-3 overflow-y-auto scrollbar-hide select-none">
      <p class="text-lg leading-snug w-full font-handwriting">${note.text}</p>
      ${note.author ? `<p class="text-sm mt-auto pt-4 text-right italic opacity-80 w-full font-handwriting">- ${note.author}&nbsp;&nbsp;</p>` : ""}
    </div>
  `;

  div.style.position = "absolute";
  div.style.fontFamily = "'Caveat', cursive";
  return div;
}
