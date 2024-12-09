// Initialize the map and set its view to the center of the world with a zoom level of 2
const map = L.map("map").setView([0, 0], 2);

// Add a tile layer using OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors", // Attribution for OpenStreetMap
}).addTo(map);

// URL for the earthquake data (GeoJSON format)
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the earthquake data and process it
fetch(earthquakeUrl)
  .then((response) => response.json()) // Parse the JSON response
  .then((data) => createFeatures(data.features)); // Pass the data to the createFeatures function

// Function to process and display earthquake data on the map
function createFeatures(earthquakeData) {
  // Function to determine the color of a marker based on earthquake depth
  function getColor(depth) {
    return depth > 90 ? "#ff0000" :        // Red for the deepest earthquakes
           depth > 70 ? "#ff4500" :        // Orange-Red for moderately deep earthquakes
           depth > 50 ? "#ff8c00" :        // Dark Orange
           depth > 30 ? "#ffd700" :        // Gold
           depth > 10 ? "#adff2f" :        // Yellow-Green
                        "#00ff00";         // Green for shallow earthquakes
  }

  // Function to determine the radius of a marker based on earthquake magnitude
  function getRadius(magnitude) {
    return magnitude * 4; // Scale the radius to make it visually noticeable
  }

  // Function to bind popups to each marker with earthquake information
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3><hr>
       <p><b>Magnitude:</b> ${feature.properties.mag}</p>
       <p><b>Depth:</b> ${feature.geometry.coordinates[2]} km</p>` // Display location, magnitude, and depth
    );
  }

  // Create a GeoJSON layer to add earthquake markers to the map
  const earthquakes = L.geoJSON(earthquakeData, {
    // Convert each point to a circle marker with styling
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: getRadius(feature.properties.mag), // Set radius based on magnitude
        fillColor: getColor(feature.geometry.coordinates[2]), // Set color based on depth
        color: "#000", // Black border
        weight: 0.5, // Border thickness
        opacity: 1, // Border opacity
        fillOpacity: 0.8, // Marker fill opacity
      });
    },
    onEachFeature: onEachFeature, // Bind popups to markers
  });

  // Add the earthquake markers to the map
  earthquakes.addTo(map);

  // Call the function to create the legend
  createLegend();
}

// Function to create a legend for the map
function createLegend() {
  const legend = L.control({ position: "bottomright" }); // Position the legend at the bottom-right corner

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend"); // Create a div element for the legend
    const depths = [-10, 10, 30, 50, 70, 90]; // Depth intervals
    const colors = ["#00ff00", "#adff2f", "#ffd700", "#ff8c00", "#ff4500", "#ff0000"]; // Colors for each interval

    // Add a title to the legend
    div.innerHTML += "<h4>Depth (km)</h4>";

    // Loop through the depth intervals and create legend entries
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<div style="display: flex; align-items: center; margin-bottom: 4px;">
          <i style="width: 18px; height: 18px; background:${colors[i]}; display: inline-block; margin-right: 8px;"></i>
          <span>${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}` : "+"}</span>
        </div>`; // Format depth ranges
    }

    return div; // Return the legend div
  };

  // Add the legend to the map
  legend.addTo(map);
}
