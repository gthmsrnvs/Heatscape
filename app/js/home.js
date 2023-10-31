import { Chart } from 'chart.js';

// Function to handle temperature change
function handleTemperatureChange(event) {
  const value = event.target.value;
  const tempAsFloat = value.getFloat32(0, true); // read as little-endian
  console.log(`Received ${tempAsFloat}`);
  
  // Update the temperature value in the <h1> element
  const temperatureValueElement = document.getElementById('temperatureValue');
  temperatureValueElement.innerText = `Temperature: ${tempAsFloat} °C`;
}


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

// Add an event listener to connect and start receiving data when the button is clicked
document.getElementById('connectButton').addEventListener('click', connectAndReceiveData);