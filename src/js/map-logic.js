// src/map-logic.js
import "sheetrock";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1vzSMuzoYv9H40xQmpXCjHALZmx3ALnb9WH-musGAvqo/gviz/tq?tqx=out:csv&gid=2122626799";

export function loadPins(map) {
  const bounds = new google.maps.LatLngBounds();

  window.$("#map").sheetrock({
    url: SHEET_URL,
    query: "select A, B, C, D, E, F",
    callback: function (error, options, response) {
      if (error) {
        console.error("Sheetrock Error:", error);
        return;
      }

      if (!response.rows || response.rows.length <= 1) return;

      // Initialize counters
      let countYes = 0;
      let countMaybe = 0;
      let countNo = 0;

      response.rows.forEach((row, index) => {
        if (index === 0) return; // Skip header

        const name = row.cellsArray[0];
        const rsvp = row.cellsArray[1] || "";
        const location = row.cellsArray[2];
        const note = row.cellsArray[3] || "";
        const lat = parseFloat(row.cellsArray[4]);
        const lng = parseFloat(row.cellsArray[5]);
        const rsvpLower = rsvp.toLowerCase();

        // --- PART 1: Update the "Who's Coming" Lists ---
        let listId = "";
        if (rsvpLower.includes("yes")) {
          listId = "list-yes";
          countYes++;
        } else if (rsvpLower.includes("maybe")) {
          listId = "list-maybe";
          countMaybe++;
        } else if (rsvpLower.includes("no")) {
          listId = "list-no";
          countNo++;
        }

        if (name && listId) {
          const listEl = document.getElementById(listId);
          if (listEl) {
            const ele = document.createElement("div");
            ele.textContent = name;
            listEl.appendChild(ele);
          }
        }

        // --- PART 2: Create Map Pins (Only if we have Lat/Lng) ---
        if (!isNaN(lat) && !isNaN(lng)) {
          const jitterLat = (Math.random() - 0.5) * 0.15;
          const jitterLng = (Math.random() - 0.5) * 0.15;
          const finalPos = { lat: lat + jitterLat, lng: lng + jitterLng };

          let pinColor = "#808080"; // Default Grey
          if (rsvpLower.includes("yes"))
            pinColor = "#006400"; // BHS Green
          else if (rsvpLower.includes("maybe")) pinColor = "#ffcc00"; // Gold

          const marker = new google.maps.Marker({
            map: map,
            position: finalPos,
            title: name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: pinColor,
              fillOpacity: 0.9,
              scale: 8,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: sans-serif; padding: 5px; color: #333;">
                <strong style="font-size: 18px;">${name}</strong><br>
                <span style="font-size: 12px;">Attending: ${rsvp}</span><br>
                <small style="color: #666;">${location}</small>
                ${note ? `<p style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 5px; min-width: 250px; max-width: 340px;"><em>"${note}"</em></p>` : ""}
              </div>`,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));
          bounds.extend(finalPos);
          map.fitBounds(bounds);
        }
      });
      // After the loop, update your headlines or badges
      updateCountDisplay("count-yes", countYes);
      updateCountDisplay("count-maybe", countMaybe);
      updateCountDisplay("count-no", countNo);

      // Helper function to update the DOM
      function updateCountDisplay(id, count) {
        const el = document.getElementById(id);
        if (el) el.textContent = `(${count})`;
      }

      // THIS IS THE FIX for Dev Mode:
      window.initMap = initMap;
    },
  });
}
