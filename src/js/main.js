import "./jquery-global.js";
import { loadPins } from "./map-logic.js";

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
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzjyvO6nipB3IwyNapX-_j8ejzoCrXkjC3xus5ynmbs0S2K9s3PptH0iCo1lq9nWhQr/exec";

  const skeleton = document.getElementById("chart-skeleton");
  const chartCanvas = document.getElementById("momentumChart");
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

// Feedback section
//
const feedbackData = [
  {
    text: "At the last reunion, we wore lanyards with our old pictures on them. And to be honest, I hadn’t seen anybody in a long time and didn’t recognize most of our classmates, and the lanyards made it really hard for me to cheat, especially since they were quite often turned around and I couldn’t see the pictures at all! 😂 A button that people can pin near their shoulders, will make it much easier for those of us who have been out of touch for a while. Thanks!",
    type: "scrap",
    variant: "legal",
    author: "Class of '86 Grad",
  },
  {
    text: "Request: 'In Your Eyes' - Peter Gabriel. For the whole '86 Football team.",
    type: "neon-pink",
    author: "Chandler",
  },
  {
    text: "Can we get a dedicated 80s dance floor?",
    type: "post-it",
    author: "Shelley",
  },
  { text: "", type: "blank", author: "" }, // The "+" Note
];

document.addEventListener("DOMContentLoaded", () => {
  const wall = document.getElementById("note-wall");
  if (!wall) return; // Safety check

  feedbackData.forEach((note, index) => {
    const div = document.createElement("div");

    // Alternate notes left and right of the center player
    const isLeft = index % 2 === 0;
    const left = isLeft
      ? Math.floor(Math.random() * 30) + 5 // 5% to 35% (Left side)
      : Math.floor(Math.random() * 30) + 65; // 65% to 95% (Right side)

    const top = Math.floor(Math.random() * 70) + 5;
    const rotation = Math.floor(Math.random() * 20) - 10;

    // Base Tailwind Classes
    // div.className = `absolute pointer-events-auto cursor-pointer transition-all duration-300 transform
    //                 hover:z-50 hover:scale-110 hover:rotate-0 p-6 shadow-lg hover:shadow-2xl
    //                 ${getNoteStyles(note.type)}`;
    // Ensure this is exactly what you have
    div.className = getNoteStyles(note);
    div.style.top = `${top}%`;
    div.style.left = `${left}%`;
    div.style.transform = `rotate(${rotation}deg)`;
    div.style.width = note.type === "scrap" ? "280px" : "200px";

    div.innerHTML = `
      <div class="font-handwriting text-slate-800 h-full overflow-y-auto scrollbar-hide">
        ${note.type === "blank" ? "..." : note.text}
        ${note.author ? `<p class="text-xs mt-2 text-right italic pr-4">- ${note.author}</p>` : ""}
      </div>
    `;

    wall.appendChild(div);
  });
});

function getNoteStyles(note) {
  const base =
    "absolute pointer-events-auto cursor-pointer transition-all duration-300 transform hover:z-50 hover:scale-110 hover:rotate-0 p-6 shadow-lg hover:shadow-2xl ";

  switch (note.type) {
    case "post-it":
      return base + "bg-yellow-200 aspect-square w-52";

    case "neon-pink":
      return base + "bg-pink-400 aspect-square w-52 text-white font-bold";

    case "scrap":
      if (note.variant === "legal") {
        return (
          base +
          "bg-yellow-100 border-t-8 border-yellow-400 w-80 min-h-[350px] bg-[linear-gradient(#94d2ff_1px,transparent_1px)] bg-[size:100%_1.2rem] text-[15px] leading-[1.2rem]"
        );
      }
      return (
        base + "bg-white border-l-4 border-red-400 w-72 min-h-[200px] shadow-sm"
      );

    case "blank":
      return (
        base +
        "bg-white/10 border-2 border-dashed border-white/30 aspect-square w-48 items-center justify-center"
      );

    default:
      return base + "bg-white aspect-square w-52";
  }
}
