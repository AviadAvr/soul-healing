/* =========================================================
   Soul Pathways — map.js
   Interactive minimap (Leaflet + OpenStreetMap, no API key)
   showing the two Amsterdam session locations.
   ========================================================= */
(function () {
    "use strict";

    var mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") {
        return;
    }

    // --- Session locations (approximate coordinates) ---
    var locations = [
        {
            name: "Common Ground",
            address: "Zeeburgerdijk 265, 1095 AC Amsterdam",
            coords: [52.36636, 4.94287],
            color: "#7d9b78"
        },
        {
            name: "The Integration Room",
            address: "Eerste Laurierdwarsstraat 2, 1016 PX Amsterdam",
            coords: [52.37246, 4.88196],
            color: "#8a7aa8"
        }
    ];

    // --- Initialise map ---
    var map = L.map("map", {
        scrollWheelZoom: false, // avoid hijacking page scroll
        zoomControl: true
    });

    // OpenStreetMap tiles — free, no API key required
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- Build a coloured circular marker ---
    function makeIcon(color) {
        return L.divIcon({
            className: "sp-pin",
            html:
                '<span style="' +
                "display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;" +
                "transform:rotate(-45deg);background:" + color + ";" +
                "border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);" +
                '"></span>',
            iconSize: [22, 22],
            iconAnchor: [11, 22],
            popupAnchor: [0, -22]
        });
    }

    var bounds = [];

    locations.forEach(function (loc) {
        var marker = L.marker(loc.coords, { icon: makeIcon(loc.color) }).addTo(map);
        marker.bindPopup(
            "<strong>" + loc.name + "</strong><br>" + loc.address
        );
        bounds.push(loc.coords);
    });

    // --- Frame both markers nicely on any screen ---
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

    // Re-enable scroll zoom only after the user clicks the map
    map.on("click", function () {
        map.scrollWheelZoom.enable();
    });
    map.on("mouseout", function () {
        map.scrollWheelZoom.disable();
    });
})();

