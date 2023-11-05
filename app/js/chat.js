import { Application } from '@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);
app.load('https://prod.spline.design/oDTAahU9O3e6IAPy/scene.splinecode');

// Replace this placeholder with your OpenAI API key
const openAiApiKey = "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";

// Initialize variables for context, set default values
let userLocation = "Central Coast, NSW, Australia";
let currentBodyTemp = window.currentBodyTemp || "38°C"; // Default value if not set
console.log(currentBodyTemp);
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
  console.log(input);
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
async function callOpenAiApi(input, apiKey, location, currentTemp, weather) {
  // Prepare data for API call
  const data = {
    model: "gpt-4",  // Specify GPT-4 model
    messages: [
      {
        "role": "system",
        "content": "You are a personalized heat mitigation strategist. Provide concise and personalised advice based on the user's request, utilising their real-time body temperature, location, and weather. Your responses must be within 40 words."
      },
      {
        "role": "user",
        "content": `Current Body Temperature: ${currentTemp}\nCurrent Location: ${location}\nCurrent Weather: ${weather}\n${input}`
      }
    ],
    max_tokens: 50  // Limit to 50 tokens
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

