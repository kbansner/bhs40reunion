import "sheetrock";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1vzSMuzoYv9H40xQmpXCjHALZmx3ALnb9WH-musGAvqo/gviz/tq?tqx=out:csv&gid=2122626799";

export function loadPins(map) {
  const bounds = new google.maps.LatLngBounds();

  // --- NEW: Clear existing lists before repopulating ---
  ["list-yes", "list-maybe", "list-no"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });

  window.$("#map").sheetrock({
    url: SHEET_URL,
    query: "select A, B, C, D, E, F",
    callback: function (error, options, response) {
      if (error) {
        console.error("Sheetrock Error:", error);
        return;
      }

      if (!response || !response.rows || response.rows.length <= 1) return;

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

        // 1. Determine List and Update Counters
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

        // 2. Add to "Who's Coming" sidebar
        if (name && listId) {
          const listEl = document.getElementById(listId);
          if (listEl) {
            const ele = document.createElement("div");
            ele.className = "py-1 border-b border-gray-100 last:border-0"; // Optional styling
            ele.textContent = name;
            listEl.appendChild(ele);
          }
        }

        // 3. Create Map Pins (Only if we have Lat/Lng)
        if (!isNaN(lat) && !isNaN(lng)) {
          // Reduced Jitter to ~1-2 blocks instead of 10 miles
          const jitterLat = (Math.random() - 0.5) * 0.02;
          const jitterLng = (Math.random() - 0.5) * 0.02;
          const finalPos = { lat: lat + jitterLat, lng: lng + jitterLng };

          let pinColor = "#808080";
          if (rsvpLower.includes("yes"))
            pinColor = "#006400"; // BHS Green
          else if (rsvpLower.includes("maybe")) pinColor = "#C6A119"; // Gold

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
              <div style="font-family: sans-serif; padding: 5px; color: #333; min-width: 150px;">
                <strong style="font-size: 16px;">${name}</strong><br>
                <div style="font-size: 12px; margin-top: 4px;">Attending: ${rsvp}</div>
                <div style="font-size: 12px; color: #666;">${location}</div>
                ${note ? `<p style="margin-top: 8px; border-top: 1px solid #ddd; padding-top: 8px; font-style: italic;">"${note}"</p>` : ""}
              </div>`,
          });

          marker.addListener("click", () => infoWindow.open(map, marker));
          bounds.extend(finalPos);
        }
      });

      // Update the Map view
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }

      // Update the total counts in the headers
      updateCountDisplay("count-yes", countYes);
      updateCountDisplay("count-maybe", countMaybe);
      updateCountDisplay("count-no", countNo);
    },
  });
}

function updateCountDisplay(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = `(${count})`;
}
