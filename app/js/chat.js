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

// Function to show bot typing indicator
function showBotTyping() {
  const messagesDiv = document.getElementById('messages');
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'bot-typing-indicator';
  typingIndicator.textContent = 'Heatscape is typing...';
  messagesDiv.appendChild(typingIndicator);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to hide bot typing indicator
function hideBotTyping() {
  const typingIndicator = document.querySelector('.bot-typing-indicator');
  if (typingIndicator) {
      typingIndicator.remove();
  }
}

// Function to send user message to bot
async function sendMessage() {
  const input = document.getElementById('userInput').value;
  if (input.trim() === '') return;
  addUserMessage(input);

  // Show bot typing indicator
  showBotTyping();

  // Call OpenAI API for bot's response
  try {
      const botResponse = await callOpenAiApi(input, openAiApiKey);

      // Hide bot typing indicator
      hideBotTyping();

      // Add bot's response to the chat
      addBotMessage(botResponse);
  } catch (error) {
      console.error(error);
      // Hide bot typing indicator in case of error
      hideBotTyping();
      addBotMessage('I encountered an error while processing your request.');
  }

  document.getElementById('userInput').value = '';
}


// Function for OpenAI API call
async function callOpenAiApi(input, apiKey) {
  const userLocation = window.userLocation || "University of Sydney"; // Default to Central Coast if location not obtained
  const currentTemp = window.currentBodyTemp || "38°C"; // Use the global variable or default value

  // Prepare data for API call
  const data = {
    model: "gpt-4",  // Specify GPT-4 model
    messages: [
      {
        "role": "system",
        "content": "Based on the location of University of Sydney, generate a personalized plan for the next 2-3 hours to help the user cool down, taking into consideration the current high temperatures and the user's preferences. Offer a concise and smart guide including nearby locations that are cooler and less crowded, tips for avoiding heat stress, and any necessary precautions they should take given the UV index. If relevant, suggest hydration options and potential indoor activities that align with the user's preferences. You are a heat mitigation assistant that is helping the user to cool down and avoid heat stress. Your response must be within 50 words. you also have the ability to provide a detailed daily plan for the user to follow using emojis and within the 50 words, you can plan for future events using your knowledge of the location and by guessing the weather conditions for that day."
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
