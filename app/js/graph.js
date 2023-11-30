import 'chartjs-adapter-date-fns';
import { SmoothieChart, TimeSeries } from 'smoothie';

// Global variable to store the previous temperature reading
let previousTemperature = null;
window.userLocation = { lat: null, lng: null };

// Function to get the user's current location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      window.userLocation.lat = position.coords.latitude;
      window.userLocation.lng = position.coords.longitude;
    }, error => {
      console.error('Error getting location:', error);
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
}

// Call getUserLocation when the script loads
getUserLocation();

// Create a TimeSeries instance to store the data
const temperatureTimeSeries = new TimeSeries();

// Create a new SmoothieChart instance with specified axes ranges and no grid
const temperatureChart = new SmoothieChart({
  grid: {
    strokeStyle: 'transparent', // Make grid lines transparent
    fillStyle: 'transparent',   // Make background transparent
    lineWidth: 0,               // No grid lines
    millisPerLine: 0,
    verticalSections: 0,
  },
  labels: { fillStyle: '#FFFFFF' }, // Label color
  minValue: 20, // Minimum value for Y-axis
  maxValue: 40, // Maximum value for Y-axis
  millisPerPixel: 154, // Horizontal scale control
  horizontalLines: [
    { color: '#ffffff', lineWidth: 1, value: 15 },
    { color: '#ffffff', lineWidth: 1, value: 45 },
  ],
});

// Add the TimeSeries instance to the chart
temperatureChart.addTimeSeries(temperatureTimeSeries, {
  strokeStyle: '#ffffff', // Line color
  fillStyle: 'transparent',              // Area under the line is transparent
  lineWidth: 2,                           // Line width
});

// Call this function to start the chart streaming
function startChart() {
  const canvas = document.getElementById('temperatureChart');
  canvas.height = 250; // Set the height of the chart
  canvas.width = window.innerWidth; // Set the width to match the screen width
  temperatureChart.streamTo(canvas, 1000); // Delay of 1000ms
}

// Global variable to store the Bluetooth characteristic
let globalCharacteristic;

// Function to update the fluctuation display
function updateFluctuationDisplay(currentTemperature) {
  const fluctuationOverlay = document.getElementById('fluctuationOverlay');
  if (fluctuationOverlay) { // Check if the element exists
    const fluctuation = Math.abs(currentTemperature - previousTemperature);
    fluctuationOverlay.textContent = `Fluctuation: ${fluctuation.toFixed(2)}°C`;
  } else {
    console.error('Fluctuation overlay element not found');
  }
}

// Function to handle temperature change
function handleTemperatureChange(value) {
  if (!value) {
    console.error('Sensor disconnected or value not received.');
    return;
  }
  const tempAsFloat = value.getFloat32(0, true);
  console.log(tempAsFloat);
  const temperatureElement = document.getElementById('temperatureValue');
  console.log(temperatureElement.innerHTML)
  const riskLevelTextElement = document.getElementById('riskLevelText');
  const tempDirectionIconElement = document.getElementById('tempDirectionIcon');
  const scrollContainerElement = document.getElementById("scrollContainer")

  if (temperatureElement.innerHTML < 36) {
    riskLevelTextElement.innerHTML = "Normal Temperature";
    scrollContainerElement.style.background = "var(--normal-bg)";
  } else if (temperatureElement.innerHTML < 37) {
    riskLevelTextElement.innerHTML = "Low Risk";
    scrollContainerElement.style.background = "var(--low-risk-bg)";
  } else if (temperatureElement.innerHTML < 38) {
    riskLevelTextElement.innerHTML = "Medium Risk";
    scrollContainerElement.style.background = "var(--med-risk-bg)";
  }else if (temperatureElement.innerHTML < 40) {
    riskLevelTextElement.innerHTML = "High Risk";
    scrollContainerElement.style.background = "var(--high-risk-bg)";
  }

  // Update the temperature value on the page
  temperatureElement.innerText = `${tempAsFloat.toFixed(1)}`;

  // Display the overheat popup panel when users are overheated
  updateOverheatPopup();

  // If there is a previous temperature, calculate fluctuation and update display
  if (previousTemperature !== null) {
    const tempDifference = tempAsFloat - previousTemperature;
    updateFluctuationDisplay(tempAsFloat); // Call the function to update the fluctuation display

    // Update the direction of the temperature change
    if (tempDifference > 0) {
      tempDirectionIconElement.className = 'fas fa-arrow-up';
    } else if (tempDifference < 0) {
      tempDirectionIconElement.className = 'fas fa-arrow-down';
    } else {
      tempDirectionIconElement.className = ''; // No change
    }
  }

  // Store the current temperature as the previous temperature for the next update
  previousTemperature = tempAsFloat;

  switch (tempAsFloat) {
    case (tempAsFloat < 36):
      riskLevelTextElement.innerHTML = "Normal Temperature";
      scrollContainerElement.style.background = "var(--normal-bg)";
      break;
    case (36 <= tempAsFloat < 37):
      riskLevelTextElement.innerHTML = "Low Risk";
      scrollContainerElement.style.background = "var(--low-risk-bg)";
      break;
    case (37 <= tempAsFloat < 38):
      riskLevelTextElement.innerHTML = "Medium Risk";
      scrollContainerElement.style.background = "var(--med-risk-bg)";
      break;
    case (tempAsFloat > 38):
      riskLevelTextElement.innerHTML = "High Risk";
      scrollContainerElement.style.background = "var(--high-risk-bg)";
      break;        
    default:
      break;
  }

  // Append new data point with current timestamp and temperature value
  temperatureTimeSeries.append(new Date().getTime(), tempAsFloat);
}

// Function to start reading the temperature data
function startReadingTemperature() {
  setInterval(() => {
    if (globalCharacteristic) {
      globalCharacteristic.readValue().then(handleTemperatureChange);
    }
  }, 2000);
}

// Add an event listener to connect and start receiving data when the button is clicked
document.getElementById('connectButton').addEventListener('click', connectAndReceiveData);

// Function to connect to the device and start receiving data
function connectAndReceiveData() {
  navigator.bluetooth
    .requestDevice({ filters: [{ services: ['12345678-1234-5678-1234-56789abcdef0'] }] })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService('12345678-1234-5678-1234-56789abcdef0'))
    .then(service => service.getCharacteristic('12345678-1234-5678-1234-56789abcdef1'))
    .then(characteristic => {
      globalCharacteristic = characteristic;
      return characteristic.readValue();
    })
    .then(value => {
      handleTemperatureChange(value);
      startReadingTemperature();
    })
    .catch(error => console.error('Error:', error));
}

// Call startChart when the page loads
document.addEventListener('DOMContentLoaded', startChart);

// Display the overheat popup panel when users are overheated
let overheatPopup = document.getElementById("overheatPopup");
function updateOverheatPopup(currentTemperature) {
  if (!overheatPopup) overheatPopup = document.getElementById("overheatPopup");

  if (currentTemperature > 30 && overheatPopup.classList.contains("hidden")) overheatPopup.classList.remove("hidden");
  else if (currentTemperature <= 30 && !overheatPopup.classList.contains("hidden")) overheatPopup.classList.add("hidden");
}

document.addEventListener('DOMContentLoaded', startChart);

//Change the color of the background based on the temperature

