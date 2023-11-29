let map;
let service;
let infowindow;

function initMap() {
  // Fixed coordinates
  const fixedLocation = { lat: -33.8886, lng: 151.1873 };

  map = new google.maps.Map(document.getElementById("map-container"), {
    center: fixedLocation,
    zoom: 12,
  });

  infowindow = new google.maps.InfoWindow();

  const request = {
    location: fixedLocation,
    radius: '5000',
    keyword: 'park swimming pool library cafe' // Adjust keywords as needed
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      results.forEach(place => {
        if (place.geometry && place.geometry.location) {
          createMarker(place);
        }
      });
    }
  });
  // Create a marker for the user's location with a custom icon
const userLocationMarker = new google.maps.Marker({
    position: { lat: -33.8886, lng: 151.1873 }, // Replace with user's location
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'red', // Change the color to your desired color
      fillOpacity: 0.7,
      strokeWeight: 0,
      scale: 10, // Adjust the size of the marker
    },
    title: 'User Location', // Tooltip text
  });
  
  // Add the marker to the map
  userLocationMarker.setMap(map);
function createMarker(place) {
  const marker = new google.maps.Marker({
    map: map,
    icon: {
        path: google.maps.SymbolPath.MARKER,
        fillColor: 'blue', // Change the color to your desired color
        fillOpacity: 0.7,
        strokeWeight: 0,
        scale: 10, // Adjust the size of the marker
      },
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', () => {
    infowindow.setContent(place.name);
    infowindow.open(map, marker);
  });
}
}

initMap();
