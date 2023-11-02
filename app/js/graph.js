import 'chartjs-adapter-date-fns';
import { SmoothieChart, TimeSeries } from 'smoothie';

// Create a TimeSeries instance to store the data
const temperatureTimeSeries = new TimeSeries();

// Create a new SmoothieChart instance with transparent background and no grid
const temperatureChart = new SmoothieChart({
  grid: {
    strokeStyle: 'transparent', // Make grid lines transparent
    fillStyle: 'transparent',   // Make background transparent
    lineWidth: 0,               // No grid lines
    millisPerLine: 0,
    verticalSections: 0,
  },
  labels: { fillStyle: '#000000' }, // Label color
  horizontalLines: [],
});

// Add the TimeSeries instance to the chart
temperatureChart.addTimeSeries(temperatureTimeSeries, {
  strokeStyle: 'rgba(0, 255, 0, 1)', // Line color
  fillStyle: 'transparent',          // Area under the line is transparent
  lineWidth: 2,                      // Line width
});

// Call this function to start the chart streaming
function startChart() {
  const canvas = document.getElementById('temperatureChart');
  temperatureChart.streamTo(canvas, 1000); // Delay of 1000ms
}

// Global variable to store the Bluetooth characteristic
let globalCharacteristic;

// Function to handle temperature change
function handleTemperatureChange(value) {
  if (!value) {
    console.error('Sensor disconnected or value not received.');
    return;
  }
  const tempAsFloat = value.getFloat32(0, true);
  document.getElementById('temperatureValue').innerText = `Temperature: ${tempAsFloat}`;
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
