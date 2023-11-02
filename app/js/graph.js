import 'chartjs-adapter-date-fns';
import { SmoothieChart, TimeSeries } from 'smoothie';

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
  maxValue: 30, // Maximum value for Y-axis
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
  canvas.height = 150; // Set the height of the chart
  canvas.width = window.innerWidth; // Set the width to match the screen width
  temperatureChart.streamTo(canvas, 1000); // Delay of 1000ms
}

// Global variable to store the Bluetooth characteristic
let globalCharacteristic;

// Function to update the fluctuation display
function updateFluctuationDisplay(currentTemperature, previousTemperature) {
  const fluctuationOverlay = document.getElementById('fluctuationOverlay');
  const fluctuation = Math.abs(currentTemperature - previousTemperature);
  fluctuationOverlay.textContent = `Fluctuation: ${fluctuation.toFixed(2)}°C`;
}

// Global variable to store the previous temperature
let previousTemperature = null;

// Function to handle temperature change
function handleTemperatureChange(value) {
  if (!value) {
    console.error('Sensor disconnected or value not received.');
    return;
  }
  const tempAsFloat = value.getFloat32(0, true);
  const temperatureElement = document.getElementById('temperatureValue');
  const riskLevelTextElement = document.getElementById('riskLevelText');
  const tempDirectionIconElement = document.getElementById('tempDirectionIcon');
  
  // Assuming you have a previous temperature value stored
  const previousTemp = parseFloat(temperatureElement.innerText);
  const tempDifference = tempAsFloat - previousTemp;

  // Update the temperature value on the page
  temperatureElement.innerText = `${tempAsFloat.toFixed(1)} °C`;

  // Determine and update the risk level based on the temperature
  if (tempAsFloat > 30) {
    riskLevelTextElement.innerText = 'High Risk';
  } else if (tempAsFloat > 25) {
    riskLevelTextElement.innerText = 'Medium Risk';
  } else {
    riskLevelTextElement.innerText = 'Low Risk';
  }

  // Update the direction of the temperature change
  if (tempDifference > 0) {
    tempDirectionIconElement.className = 'fas fa-arrow-up';
  } else if (tempDifference < 0) {
    tempDirectionIconElement.className = 'fas fa-arrow-down';
  } else {
    tempDirectionIconElement.className = ''; // No change
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
