// Replace this placeholder with your actual OpenAI API key
const openAiApiKey = "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";

// Define findCoolPlacesNearUser in the global scope
window.findCoolPlacesNearUser = async function() {
  const userLocation = window.userLocation;
  if (!userLocation) {
    addBotMessage("I'm still waiting to get your location.");
    return;
  }

  const map = new google.maps.Map(document.createElement("div"));
  const service = new google.maps.places.PlacesService(map);
  const request = {
    location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
    radius: '5000',
    keyword: 'park library cafe convenience store'
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
      const placesLinks = results.map(place => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
        return `<a href="${googleMapsUrl}" target="_blank">${place.name}</a>`;
      }).join("<br>");
      addBotMessage(`Here are some places to cool down near you:<br>${placesLinks}`);
    } else {
      addBotMessage("I couldn't find any cool places nearby.");
    }
  });
};

// Initialize chatbot on page load
document.addEventListener("DOMContentLoaded", function () {
  getUserLocation(); // Get the user's current location
  document.getElementById('sendButton').addEventListener('click', sendMessage);
});

// Function to send user message to bot
async function sendMessage() {
  const input = document.getElementById('userInput').value;
  if (input.trim() === '') return;
  addUserMessage(input);

  // Call OpenAI API for bot's response
  const botResponse = await callOpenAiApi(input, openAiApiKey);

  if (botResponse === 'show_date_picker') {
    document.getElementById('datePickerContainer').style.display = 'block';
  } else {
    addBotMessage(botResponse);
  }
  document.getElementById('userInput').value = '';
}

// Function for OpenAI API call
async function callOpenAiApi(input, apiKey) {
  const userLocation = window.userLocation || "Central Coast, NSW, Australia"; // Default to Central Coast if location not obtained
  const currentTemp = window.currentBodyTemp || "38°C"; // Use the global variable or default value

  // Prepare data for API call
  const data = {
    model: "gpt-4",  // Specify GPT-4 model
    messages: [
      {
        "role": "system",
        "content": "You are a helpful assistant. Answer questions accurately."
      },
      {
        "role": "user",
        "content": input
      }
    ],
    max_tokens: 150
  };

  // Make API call
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(error);
    return 'I encountered an error while processing your request.';
  }
}

// Function to add bot message to chat
function addBotMessage(text) {
  const messagesDiv = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = 'bot';
  message.innerHTML = text; // Use innerHTML to parse the anchor tags
  messagesDiv.appendChild(message);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to add user message to chat
function addUserMessage(text) {
  const messagesDiv = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = 'user';
  message.textContent = text;
  messagesDiv.appendChild(message);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to get the user's current location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // After getting the location, wait for the Google Maps script to load before calling findCoolPlacesNearUser
        waitForGoogleMaps().then(findCoolPlacesNearUser);
      },
      (error) => {
        console.error("Error Code = " + error.code + " - " + error.message);
        addBotMessage("Unable to retrieve your location. Please ensure location services are enabled.");
      }
    );
  } else {
    addBotMessage("Geolocation is not supported by your browser.");
  }
}

// Utility function to wait for the Google Maps API to be loaded
function waitForGoogleMaps() {
  return new Promise((resolve) => {
    if (typeof google !== 'undefined' && google.maps) {
      resolve();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          clearInterval(checkGoogleMaps);
          resolve();
        }
      }, 100);
    }
  });
}
