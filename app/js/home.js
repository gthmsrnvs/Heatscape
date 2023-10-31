// Import Chart.js (make sure you have included Chart.js in your HTML)
import Chart from 'chart.js/auto';

// Initialize the Chart.js configuration
const ctx = document.getElementById('temperatureChart').getContext('2d');
const temperatureChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperature',
      data: [],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      },
      y: {
        beginAtZero: true
      }
    }
  }
});

// Function to handle temperature change
function handleTemperatureChange(event) {
  const value = event.target.value;
  const tempAsFloat = value.getFloat32(0, true);

  // Update the <h1> element with the temperature value
  document.getElementById('temperatureValue').innerText = tempAsFloat;

  // Update the Chart.js data
  temperatureChart.data.labels.push(new Date().toLocaleTimeString());
  temperatureChart.data.datasets[0].data.push(tempAsFloat);

  // Limit the number of data points displayed to maintain a smooth real-time graph
  const maxDataPoints = 10;
  if (temperatureChart.data.labels.length > maxDataPoints) {
    temperatureChart.data.labels.shift();
    temperatureChart.data.datasets[0].data.shift();
  }

  // Update the Chart.js chart
  temperatureChart.update();
}

// Add an event listener to connect and start receiving data when the button is clicked
document.getElementById('connectButton').addEventListener('click', connectAndReceiveData);

//CONNECT & RECEIVE FROM SENSORS
// Function to handle temperature change
function handleTemperatureChange(event) {
  const value = event.target.value;
  const tempAsFloat = value.getFloat32(0, true); // read as little-endian
  console.log(`Received ${tempAsFloat}`);
}

// Add an event listener to connect and start receiving data when the button is clicked
document.getElementById('connectButton').addEventListener('click', connectAndReceiveData);

// Function to connect to the device and start receiving data
function connectAndReceiveData() {
  navigator.bluetooth
    .requestDevice({ filters: [{ services: ['12345678-1234-5678-1234-56789abcdef0'] }] })
    .then((device) => {
      console.log('Got device:', device.name);
      return device.gatt.connect();
    })
    .then((server) => {
      return server.getPrimaryService('12345678-1234-5678-1234-56789abcdef0');
    })
    .then((service) => {
      return service.getCharacteristic('12345678-1234-5678-1234-56789abcdef1');
    })
    .then((characteristic) => {
      // Read the value initially
      characteristic.readValue().then((value) => {
        handleTemperatureChange({ target: { value } });
      });

      // Set up an interval to read and update the value every 2 seconds
      setInterval(() => {
        characteristic.readValue().then((value) => {
          handleTemperatureChange({ target: { value } });
        });
      }, 2000); // 2000 milliseconds = 2 seconds
    })
    .catch((error) => {
      console.log('Error:', error);
    });
}
