// Import Chart.js
import Chart from 'chart.js';

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
        type: 'time',
        time: {
          unit: 'second'
        },
        position: 'bottom'
      },
      y: {
        beginAtZero: true
      }
    }
  }
});

// Function to handle temperature change
function handleTemperatureChange(tempAsFloat) {
  // Update the <h1> element with the temperature value
  document.getElementById('temperatureValue').innerText = tempAsFloat;

  // Update the Chart.js data
  const timestamp = new Date().toISOString();
  temperatureChart.data.labels.push(timestamp);
  temperatureChart.data.datasets[0].data.push({ x: timestamp, y: tempAsFloat });

  // Limit the number of data points displayed
  const maxDataPoints = 10;
  if (temperatureChart.data.labels.length > maxDataPoints) {
    temperatureChart.data.labels.shift();
    temperatureChart.data.datasets[0].data.shift();
  }

  // Update the Chart.js chart
  temperatureChart.update();
}

// Function to connect to the device and start receiving data
function connectAndReceiveData() {
  navigator.bluetooth
    .requestDevice({ filters: [{ services: ['12345678-1234-5678-1234-56789abcdef0'] }] })
    .then(device => {
      console.log('Got device:', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      return server.getPrimaryService('12345678-1234-5678-1234-56789abcdef0');
    })
    .then(service => {
      return service.getCharacteristic('12345678-1234-5678-1234-56789abcdef1');
    })
    .then(characteristic => {
      // Initial read
      characteristic.readValue().then(value => {
        const tempAsFloat = value.getFloat32(0, true);
        handleTemperatureChange(tempAsFloat);
      });

      // Periodic updates
      setInterval(() => {
        characteristic.readValue().then(value => {
          const tempAsFloat = value.getFloat32(0, true);
          handleTemperatureChange(tempAsFloat);
        });
      }, 2000); // Update every 2 seconds
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

// Add an event listener to start the process when the button is clicked
document.getElementById('connectButton').addEventListener('click', connectAndReceiveData);
