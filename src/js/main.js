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
  const questionnaireUrl = "https://forms.gle/BQduAPNC67e2U9YQ7"; // Replace with actual form URL
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
      // Replace '64%' with your variable, e.g., (data.percentage * 100) + '%'
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
let searchBarOriginalOffset = null;

function handleScroll() {
  // Search bar sticks ONLY when it would disappear under the sticky nav
  const stickyNavHeight = 64; // Height of the sticky nav bar

  const stickyNav = document.getElementById("sticky-nav");
  const searchNavBar = document.getElementById("search-navbar");

  if (stickyNav) {
    // Sticky nav appears at 300px
    if (window.scrollY > 300) {
      console.log("show sticky nav");
      stickyNav.classList.remove("-translate-y-full", "opacity-0");
      stickyNav.classList.add("translate-y-0", "opacity-100");
    } else {
      stickyNav.classList.add("-translate-y-full", "opacity-0");
      stickyNav.classList.remove("translate-y-0", "opacity-100");
    }
  }
  if (!searchNavBar) return;
  // Store the original position of search bar (before it becomes sticky)
  if (searchBarOriginalOffset === null) {
    searchBarOriginalOffset = searchNavBar.offsetTop;
  }

  // When scroll position + nav height reaches the search bar, lock it below nav
  if (window.scrollY + stickyNavHeight >= searchBarOriginalOffset) {
    searchNavBar.classList.add("below-sticky-nav");
  } else {
    searchNavBar.classList.remove("below-sticky-nav");
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
