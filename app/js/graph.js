import 'chartjs-adapter-date-fns';
import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { Line2 } from 'https://unpkg.com/three@0.128.0/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://unpkg.com/three@0.128.0/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://unpkg.com/three@0.128.0/examples/jsm/lines/LineGeometry.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the 3D line graph
const points = [];
const maxPoints = 100;
let line, material, geometry;

function initGraph() {
  material = new LineMaterial({
    color: 0x00ff00,
    linewidth: 5, // in pixels
  });

  geometry = new LineGeometry();
  geometry.setPositions(new Float32Array(maxPoints * 3)); // 3 vertices per point

  line = new Line2(geometry, material);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);

  scene.add(line);
}

function updateGraph(tempAsFloat) {
  if (points.length > maxPoints) {
    points.shift();
  }

  points.push(tempAsFloat);

  const positions = line.geometry.attributes.position.array;
  let index = 0;

  points.forEach((point, i) => {
    positions[index++] = i; // x
    positions[index++] = point; // y
    positions[index++] = 0; // z
  });

  line.geometry.attributes.position.needsUpdate = true;
}

initGraph();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Add any animations or updates here

  renderer.render(scene, camera);
}

animate();

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

// Function to handle temperature change
function handleTemperatureChange(event) {
  const value = event.target.value;
  const tempAsFloat = value.getFloat32(0, true);

  // Update the <h1> element with the temperature value
  document.getElementById('temperatureValue').innerText = `Temperature: ${tempAsFloat}`;
  // Update the 3D line graph
  updateGraph(tempAsFloat);
}