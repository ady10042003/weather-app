const rows = document.querySelectorAll(".row");
const city = document.querySelector(".city");

const removeTableRows = () => {
  rows.forEach((element) => {
    element.innerHTML = "";
  });
};

const updateData = async () => {
  const currentCity = await document.querySelector(".inputData").value;
  city.textContent = `${currentCity}`;

  let longitude, latitude;

  const response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${currentCity}&key=3a3dab0e2b484b10ba9bf2ccfffd7541`
  );

  let data = await response.json();

  longitude = data.results[0].geometry.lng;
  latitude = data.results[0].geometry.lat;

  removeTableRows();
  const updatedData = await getData({ longitude, latitude });
  loadData(updatedData);
};

const loadData = (data) => {
  let datetime = [];
  let tempmax = [];
  let tempmin = [];
  let humidity = [];
  let precipitation = [];
  let uvIndex = [];
  let windSpeed = [];

  for (let i = 0; i < 7; i++) {
    datetime.push(data.days[i].datetime);
    tempmax.push(toCelsius(data.days[i].tempmax));
    tempmin.push(toCelsius(data.days[i].tempmin));
    humidity.push(data.days[i].humidity);
    precipitation.push(data.days[i].precip);
    uvIndex.push(data.days[i].uvindex);
    windSpeed.push(data.days[i].windspeed);
  }

  console.log(data);

  for (let i = 0; i < rows.length; i++) {
    const datetimeTd = document.createElement("td");
    datetimeTd.textContent = datetime[i];
    rows[i].appendChild(datetimeTd);

    const tempmaxTd = document.createElement("td");
    tempmaxTd.textContent = Math.floor(tempmax[i]) + " C";
    rows[i].appendChild(tempmaxTd);

    const tempminTd = document.createElement("td");
    tempminTd.textContent = Math.floor(tempmin[i]) + " C";
    rows[i].appendChild(tempminTd);

    const humidityTd = document.createElement("td");
    humidityTd.textContent = Math.floor(humidity[i]);
    rows[i].appendChild(humidityTd);

    const windSpeedTd = document.createElement("td");
    windSpeedTd.textContent = Math.floor(windSpeed[i]);
    rows[i].appendChild(windSpeedTd);

    const precipitationTd = document.createElement("td");
    precipitationTd.textContent = Math.floor(precipitation[i] * 100) + "%";
    rows[i].appendChild(precipitationTd);

    const uvIndexTd = document.createElement("td");
    uvIndexTd.textContent = Math.floor(uvIndex[i]);
    rows[i].appendChild(uvIndexTd);
  }
};

const toCelsius = (fahrenheit) => {
  return ((fahrenheit - 32) * 5) / 9;
};

const getData = async ({ longitude, latitude }) => {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?key=UT38TF4WQZ5RY6X77U92NQ6TY`
    );
    console.log(response);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

async function main() {
  let data;
  try {
    const position = await getUserLocation();
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;

    data = await getData({ longitude, latitude });
  } catch (error) {
    console.error("Error or permission denied:", error.message);
  }

  loadData(data);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    updateData();
  }
});

main();
