// Replace this placeholder with your OpenAI API key
const openAiApiKey = "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";

// Initialize variables for context, set default values
let userLocation = "Central Coast, NSW, Australia";
let currentBodyTemp = "38*C";
let currentWeather = "Sunny";

// Initialize chatbot on page load
document.addEventListener("DOMContentLoaded", function () {
  addBotMessage("Hello again 👋");
  addBotMessage("Tell me if you are planning an event or finding cool spaces nearby.");
  document.getElementById('sendButton').addEventListener('click', sendMessage);
});

// Function to send user message to bot
async function sendMessage() {
  const input = document.getElementById('userInput').value;
  if (input.trim() === '') return;
  addUserMessage(input);

  // Call OpenAI API for bot's response
  const botResponse = await callOpenAiApi(input, openAiApiKey, userLocation, currentBodyTemp, currentWeather);

  if (botResponse === 'show_date_picker') {
    document.getElementById('datePickerContainer').style.display = 'block';
  } else {
    addBotMessage(botResponse);
  }
  document.getElementById('userInput').value = '';
}

// Function for OpenAI API call
async function callOpenAiApi(input, apiKey, location, bodyTemp, weather) {
  // Prepare data for API call
  const data = {
    model: "gpt-3.5-turbo-instruct",
    prompt: `Location: ${location}\nBody Temperature: ${bodyTemp}\nWeather: ${weather}\nUser: ${input}`,
    max_tokens: 50,
    temperature: 0
  };
  
  // Make API call using Axios from CDN
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', data, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(error);
    return 'An error occurred.';
  }
}

// Function to add bot message to chat
function addBotMessage(text) {
  const messagesDiv = document.getElementById('messages');
  const message = document.createElement('div');
  message.className = 'bot';
  message.textContent = text;
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
