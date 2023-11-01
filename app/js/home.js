import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

// Initialize the chart
const ctx = document.getElementById('temperatureChart').getContext('2d');
const temperatureChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], // Will be populated in real-time
    datasets: [{
      label: 'Temperature in Celsius',
      data: [], // Will be populated in real-time
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: false,
    }],
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear',
        min: 10,
        max: 30,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  }
});

// Function to handle temperature change
function handleTemperatureChange(event) {
  const value = event.target.value;
  const tempAsFloat = value.getFloat32(0, true);

  // Update the <h1> element with the temperature value
  document.getElementById('temperatureValue').innerText = `Temperature: ${tempAsFloat}`;

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

setupWeatherPart();
// Function to setup weather page detail
async function setupWeatherPart() {
  const date = new Date();
  const daysLst = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturaday"}
  const monthsLst = {0: "January", 1: "February", 2: "March", 3: "April", 4: "May", 5: "June", 6: "July", 7: "August", 8: "September", 9: "October", 10: "November", 11: "December"}

  const selectedDate = document.getElementById("weatherSelectedDate");
  const day = date.getDate();
  const month = monthsLst[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours();

  selectedDate.innerText = `${daysLst[date.getDay()]}, ${day} ${month} ${year}`

  const weatherData = await fetchWeatherData();

  const weatherTimeContainer = document.getElementById("weatherHourlyInner");
  for (var i = 0; i < 24; i++) {
    const weather = weatherData.weather[i];
    const now = i == hour ? true : false
    const child = generateWeatherTime(weather, i, now);

    // Change the background color based on the heat safety index
    child.classList.add(calHealthRisk(weather));

    weatherTimeContainer.appendChild(child);
  }

  await selectWeatherElement(weatherData.weather[hour], hour);
}

// Function to create the pills of different timeframes
function generateWeatherTime(weather, hr, now) {
  const weatherIconList = {
    "sunny": `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"> <path d="M14.6666 6.66671V1.33337H17.3333V6.66671H14.6666ZM23.5333 10.3334L21.6999 8.50004L25.4333 4.66671L27.2999 6.56671L23.5333 10.3334ZM25.3333 17.3334V14.6667H30.6666V17.3334H25.3333ZM14.6666 30.6667V25.3334H17.3333V30.6667H14.6666ZM8.46659 10.2667L4.66659 6.56671L6.56659 4.70004L10.3333 8.46671L8.46659 10.2667ZM25.3999 27.3334L21.6999 23.5L23.4999 21.7L27.2999 25.3667L25.3999 27.3334ZM1.33325 17.3334V14.6667H6.66659V17.3334H1.33325ZM6.56659 27.3334L4.69992 25.4334L8.43325 21.7L9.39992 22.6L10.3666 23.5334L6.56659 27.3334ZM15.9999 24C13.7777 24 11.8888 23.2223 10.3333 21.6667C8.7777 20.1112 7.99992 18.2223 7.99992 16C7.99992 13.7778 8.7777 11.8889 10.3333 10.3334C11.8888 8.77782 13.7777 8.00004 15.9999 8.00004C18.2221 8.00004 20.111 8.77782 21.6666 10.3334C23.2221 11.8889 23.9999 13.7778 23.9999 16C23.9999 18.2223 23.2221 20.1112 21.6666 21.6667C20.111 23.2223 18.2221 24 15.9999 24Z" fill="white"/> </svg>`,
    "cloudy": `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"> <path d="M25.8133 13.3866C24.8933 8.78665 20.8533 5.33331 16 5.33331C12.1467 5.33331 8.8 7.51998 7.13333 10.72C5.17365 10.9318 3.36134 11.8603 2.04465 13.3271C0.727961 14.7939 -0.000228936 16.6955 5.39903e-08 18.6666C5.39903e-08 23.08 3.58667 26.6666 8 26.6666H25.3333C29.0133 26.6666 32 23.68 32 20C32 16.48 29.2667 13.6266 25.8133 13.3866Z" fill="white"/> </svg>`,
    "rainy": `<svg xmlns="<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M28.5163 8.71061C27.4681 7.66498 26.0681 6.93498 24.4431 6.58561C24.2908 6.55282 24.1482 6.48489 24.0268 6.38723C23.9054 6.28956 23.8084 6.16488 23.7437 6.02311C23.1462 4.71794 22.2414 3.57688 21.1069 2.69748C19.655 1.58686 17.8894 0.999983 16 0.999983C13.8471 0.993149 11.7669 1.77893 10.1562 3.20748C8.64375 4.55498 7.59937 6.41623 7.12937 8.57186C7.09018 8.75433 7.00086 8.92224 6.87146 9.05672C6.74205 9.19121 6.5777 9.28692 6.39687 9.33311C4.83437 9.72686 4.165 10.1169 3.32125 10.8681C2.125 11.9331 1.5 13.3837 1.5 15.05C1.5 16.9594 2.20188 18.5275 3.52938 19.585C4.6925 20.5106 6.28125 21 8.125 21H22.75C24.825 21 26.7569 20.2837 28.1875 18.9825C29.6775 17.6294 30.5 15.7531 30.5 13.7C30.5 11.7319 29.8125 10.0069 28.5163 8.71061ZM7 28C6.81902 27.9999 6.64146 27.9507 6.48626 27.8576C6.33105 27.7645 6.20402 27.631 6.1187 27.4714C6.03338 27.3118 5.99297 27.132 6.00179 26.9513C6.0106 26.7705 6.06831 26.5955 6.16875 26.445L8.16875 23.445C8.24163 23.3357 8.33532 23.2419 8.44446 23.1689C8.5536 23.0958 8.67606 23.045 8.80484 23.0193C8.93363 22.9936 9.06621 22.9935 9.19503 23.019C9.32385 23.0446 9.44638 23.0952 9.55562 23.1681C9.66487 23.241 9.75869 23.3347 9.83172 23.4438C9.90476 23.553 9.95558 23.6754 9.98129 23.8042C10.007 23.933 10.0071 24.0656 9.98157 24.1944C9.95604 24.3232 9.90538 24.4457 9.8325 24.555L7.8325 27.555C7.7411 27.692 7.61729 27.8043 7.47206 27.8819C7.32683 27.9595 7.16468 28.0001 7 28ZM10 31C9.81907 30.9998 9.6416 30.9505 9.48648 30.8573C9.33136 30.7642 9.20442 30.6307 9.11918 30.4711C9.03393 30.3116 8.99358 30.1318 9.00242 29.9511C9.01126 29.7704 9.06896 29.5955 9.16938 29.445L13.1694 23.445C13.2423 23.3357 13.3359 23.2419 13.4451 23.1689C13.5542 23.0958 13.6767 23.045 13.8055 23.0193C13.9343 22.9936 14.0668 22.9935 14.1957 23.019C14.3245 23.0446 14.447 23.0952 14.5562 23.1681C14.6655 23.241 14.7593 23.3347 14.8323 23.4438C14.9054 23.553 14.9562 23.6754 14.9819 23.8042C15.0076 23.933 15.0077 24.0656 14.9822 24.1944C14.9567 24.3232 14.906 24.4457 14.8331 24.555L10.8331 30.555C10.7417 30.6921 10.6178 30.8044 10.4724 30.882C10.3271 30.9597 10.1648 31.0002 10 31ZM17 28C16.819 27.9999 16.6415 27.9507 16.4863 27.8576C16.3311 27.7645 16.204 27.631 16.1187 27.4714C16.0334 27.3118 15.993 27.132 16.0018 26.9513C16.0106 26.7705 16.0683 26.5955 16.1688 26.445L18.1688 23.445C18.3159 23.2244 18.5448 23.0712 18.8048 23.0193C19.0649 22.9674 19.335 23.0209 19.5556 23.1681C19.7763 23.3153 19.9294 23.5441 19.9813 23.8042C20.0332 24.0643 19.9797 24.3344 19.8325 24.555L17.8325 27.555C17.7411 27.692 17.6173 27.8043 17.4721 27.8819C17.3268 27.9595 17.1647 28.0001 17 28ZM20 31C19.819 30.9999 19.6415 30.9507 19.4863 30.8576C19.3311 30.7645 19.204 30.631 19.1187 30.4714C19.0334 30.3118 18.993 30.132 19.0018 29.9513C19.0106 29.7705 19.0683 29.5955 19.1688 29.445L23.1688 23.445C23.3159 23.2244 23.5448 23.0712 23.8048 23.0193C24.0649 22.9674 24.335 23.0209 24.5556 23.1681C24.7763 23.3153 24.9294 23.5441 24.9813 23.8042C25.0332 24.0643 24.9797 24.3344 24.8325 24.555L20.8325 30.555C20.7411 30.692 20.6173 30.8043 20.4721 30.8819C20.3268 30.9595 20.1647 31.0001 20 31Z" fill="white"/></svg>`,
    "night": `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"> <path d="M16.4667 26.6667C14.6 26.6667 12.8502 26.3111 11.2173 25.6C9.58444 24.8889 8.16222 23.9276 6.95067 22.716C5.73911 21.5053 4.77778 20.0831 4.06667 18.4493C3.35556 16.8156 3 15.0658 3 13.2C3 9.95555 4.03333 7.09422 6.1 4.616C8.16667 2.13778 10.8 0.599111 14 0C13.6 2.2 13.7222 4.35022 14.3667 6.45067C15.0111 8.55111 16.1222 10.3898 17.7 11.9667C19.2778 13.5444 21.1169 14.6556 23.2173 15.3C25.3178 15.9444 27.4676 16.0667 29.6667 15.6667C29.0889 18.8667 27.5556 21.5 25.0667 23.5667C22.5778 25.6333 19.7111 26.6667 16.4667 26.6667Z" fill="white"/> </svg>`,
  }

  const container = document.createElement("div");
  container.setAttribute("class", "weatherHourlyPills");

  const time = now ? "NOW" : weather["time"];
  const rain = weather["precipitation"];
  const temperature = weather["temperature"];

  var condition = "sunny";
  if (rain > 70) condition = "rainy";
  else if (hr < 7 || hr > 19) condition = "night";
  else if (rain > 50) condition = "cloudy";

  const weatherIcon = weatherIconList[condition];

  container.innerHTML = `
  <div class="weatherHourlyPillInner">
    <p class="weatherHourlyTime">${time}</p>
    <div class="weatherHourlyPillCenter">
      <div class="weatherHourlyIcon">${weatherIcon}</div>
      <p class="weatherHourlyRain">${rain}%</p>
    </div>
    <p class="weatherHourlyTemperature">${temperature}°C</p>
  </div>
  `

  container.addEventListener("click", () => {selectWeatherElement(weather, hr); document.getElementById("weatherContainer").style.backgroundImage = `url("/images/${condition}.png")`;});
  return container;
}

// A list of objects related to different weather cards
const riskLst = {
  "temperature": {safe: {display: "Low Health Risk", value: 24}, caution: {display: "Mild Health Risk", value: 29}, danger: {display: "High Health Risk", value: 40}},
  "uv": {safe: {display: "Low Health Risk", value: 3}, caution: {display: "Mild Health Risk", value: 6}, danger: {display: "High Health Risk", value: 9}},
  "wind": {safe: {display: "Cooler Wind", caption: "Enjoyable Outdoor Weather", value: 3}, caution: {display: "Warmer Wind", caption: "Uncomfortable Outdoor Weather", value: 6}, danger: {display: "Very Hot Wind", caption: "Dangerous Outdoor Weather", value: 9}},
  "humidity": {safe: {caption: "Stay hydrated to regulate your body temperature ", value: 60}, caution: {caption: "Stay hydrated and avoid outdoor activities", value: 80}, danger: {caption: "Stay indoors to take extra precautions for wellbeing", value: 100}}
}

// Function to create weather cards to provide extra weather information for the users 
function generateWeatherCards(weather) {  
  // Temperature Card
  const temperatureCardContent = document.querySelector(".weatherCardContainer[cardType='temperature'] .weatherCardBottom");
  const temperatureRisk = getWeatherRisk(weather, "temperature", true);
  temperatureCardContent.innerHTML = `
  <h1>${weather["temperature"]}°C</h1>
  <h4>${temperatureRisk.display}</h4>
  `

  // UV index Card
  const uvCardContent = document.querySelector(".weatherCardContainer[cardType='uv'] .weatherCardBottom");
  const uvRisk = getWeatherRisk(weather, "uv", true);
  uvCardContent.innerHTML = `
  <h1>Lv. ${weather["uv"]}</h1>
  <h4>${uvRisk["display"]}</h4>
  `

  // Wind Chill Card
  const windCardContent = document.querySelector(".weatherCardContainer[cardType='wind'] .weatherCardBottom");
  const windRisk = getWeatherRisk(weather, "wind", true);
  windCardContent.innerHTML = `
  <h2>${windRisk["display"]}</h2>
  <p>${windRisk["caption"]}</p>
  `

  // Humidity Card
  const humidityCardContent = document.querySelector(".weatherCardContainer[cardType='humidity'] .weatherCardBottom");
  const humidityRisk = getWeatherRisk(weather, "humidity", true);
  humidityCardContent.innerHTML = `
  <h1>${weather["humidity"]}%</h1>
  <p>${humidityRisk["caption"]}</p>
  `
}

// Based on each weather card risk level to calculate the seriousness of the health impact
function calHealthRisk(weather) {
  var totalHealthRisk = 0; 
  Object.keys(riskLst).forEach(type => totalHealthRisk += getWeatherRisk(weather, type, false).level);
  
  if (totalHealthRisk >= 6) return "danger"
  else if (totalHealthRisk >= 3) return "caution"
  else return "safe"
}

// Function to read the full weather info (from the json file) of a specfic time and based on the given cardType to retrieve the risk level from the riskLst
function getWeatherRisk(weather, cardType, selected) {
  const typeValue = weather[cardType];
  const curRiskLst = riskLst[cardType];
  
  var risk; 
  var end = false; 
  Object.keys(curRiskLst).forEach((level, i) => {
    const temp = curRiskLst[level]; 
    if (typeValue <= temp.value && !end) {
      if (selected) {
        const cardContainer = document.querySelector(`.weatherCardContainer[cardType='${cardType}']`);  
        cardContainer.setAttribute("cardRisk", level);
        risk = {display: temp.display, caption: temp.caption, level: i}; 
      } else {
        risk = {level: i};
      }

      end = true;
    }
  })

  return risk;
}

// Function that is triggered when the users select any pills to show the related weather cards info
async function selectWeatherElement(weather, selectedTime) {
  const heatSafetyIndex = {
    "safe": "<p>Safe</p> <span>Suitable for Outdoor Activity</span>",
    "caution": "<p>Caution</p> <span>Aware of overheated</span>",
    "danger": "<p>Danger</p> <span>Avoid outdoor activities</span>"
  }

  const allPills = document.querySelectorAll(".weatherHourlyPills");
  allPills.forEach(pill => pill.classList.remove("selected"));
  allPills[selectedTime].classList.add("selected");

  if (!weather) weather = await fetchWeatherData().weather[selectedTime];

  const weatherTimeContainer = document.getElementById("weatherHourlyInner");
  const selectedElement = weatherTimeContainer.querySelector(`:nth-child(${selectedTime + 1})`);
  weatherTimeContainer.parentElement.scrollLeft = selectedElement.offsetLeft;

  const heatIndexContainer = document.getElementById("weatherHeatIndexContainer");
  const heatIndexContent = document.getElementById("heatIndexBottom");
  const heatIndexRiskLevel = calHealthRisk(weather);
  heatIndexContainer.setAttribute("riskLevel", heatIndexRiskLevel);
  heatIndexContent.innerHTML = heatSafetyIndex[heatIndexRiskLevel];

  generateWeatherCards(weather);
}

async function fetchWeatherData() {
  // var geoLocation = getGeoLocation();
  // if (!geoLocation) geoLocation = {latitude: -33.88899486497143, longitude: 151.19222097805516};
  // console.log(`Latitude: ${geoLocation.latitude}, Longitude: ${geoLocation.longitude}`);

  // const weatherData = await getWeatherAPI(geoLocation);
  const weatherData = await fetchJSONData("/json/weather.json");
  // console.log(weatherData);

  return weatherData;
}

async function fetchJSONData(jsonFileUrl) {
  try {
    const response = await fetch(jsonFileUrl);
    if (!response.ok) throw new Error('Network response was not ok');

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error fetching or parsing the JSON file: ' + error);
  }
}

// Function to retrieve real weather data
// function getGeoLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;
//       return {latitude: latitude, longitude: longitude};
//     });
//   } else {
//     console.log("Geolocation is not supported by this browser.");
//     return;
//   }
// }

// async function getWeatherAPI(geoLocation) {
//   // This is working but freemium plan only allows 3 hrs forecast
//   try {
//     const response = await fetch('https://api.openweathermap.org/data/2.5/forecast?q=sydney&appid=50a7aa80fa492fa92e874d23ad061374');
//     if (!response.ok) {throw new Error("Wrong city name!");}

//     const data = await response.json();
//     console.log(data);
//   } catch (err) {
//     alert(err.message);
//   }
// }