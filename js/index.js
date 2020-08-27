const KEY = '224abafba9a42c52d67874bb58898374';

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

const proxy = 'https://cors-anywhere.herokuapp.com/'
const date = new Date();
const loc = document.getElementById('location');
const temp = document.getElementById('temperature');
const cond = document.getElementById('conditions');
const searchButton = document.getElementById('button-addon5');
const searchText = document.getElementById('searchtext');
const icon = document.getElementById('icon')
const timeHeader = document.getElementById('time-header');
const dateHeader = document.getElementById('date-header');
const mapDiv = document.getElementById('mapid');
const fiveDayForecastTable = document.getElementById('fiveday');
let iconId;
let lat;
let lon;
let map;

window.addEventListener('load', () => {
    setWelcomeMessage();
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;

            const url = `${proxy}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`
            getData(url);
            getFiveDayForecast(lat,lon);
            setWeatherMap(lat,lon);
        });
    }
    else {
        alert('Please enable location access to use this service');
    }
});

async function getData(url) {
    await fetch(url).then((result) => result.json()).then((result) => {
        console.log('----------Weather Data----------');
        console.log(result);
        if(result.name === undefined){
            loc.innerHTML = "Location not found!";
            temp.style.display = "none";
            cond.style.display = "none";
            icon.style.display = "none";
        }
        else {
            temp.style.display = "flex";
            cond.style.display = "flex";
            icon.style.display = "flex";
            loc.innerHTML = result.name;
            temp.innerHTML = Math.floor(result.main.temp) + ' \u00B0F';
            cond.innerHTML = result.weather[0].main;
            iconId = result.weather[0].icon;
            icon.setAttribute('data',`./icons/${iconId}.svg`);
        }
    })
}

searchButton.addEventListener('click', () => {
    const mapKey = 'CMLeIc30GHdTs4cwIZpACBJOOOPDf0Bj';
    let search = searchText.value;
    fetch(`https://open.mapquestapi.com/geocoding/v1/address?key=${mapKey}&location=${search}`)
        .then(response => response.json())
        .then(data => {
            console.log('----------Location Data----------');
            console.log(data);
            lon = data.results[0].locations[0].latLng.lng;
            lat = data.results[0].locations[0].latLng.lat;
            const url = `${proxy}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`;
            getData(url);
            map.setView(new L.LatLng(lat,lon));
        });
})

function setWelcomeMessage() {
    dateHeader.innerHTML = `Today is ${date.toLocaleDateString('en-US', options)}`;
    showTime();
}

function showTime(){
    let date = new Date();
    let h = date.getHours(); // 0 - 23
    let m = date.getMinutes(); // 0 - 59
    let s = date.getSeconds(); // 0 - 59
    let session = "AM";

    if(h == 0){
        h = 12;
    }

    if(h > 12){
        h = h - 12;
        session = "PM";
    }

    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    let time = h + ":" + m + ":" + s + " " + session;
    timeHeader.innerText = `The time is ${time}`;
    timeHeader.textContent = `The time is ${time}`;

    setTimeout(showTime, 1000);

}

function setWeatherMap(lat,lon) {
    let osm = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoicnlhbm5kIiwiYSI6ImNrZGZjNm5kNDI1bHAydHBkanA4a2ExYjcifQ.0KLe-Ld340mci31oWWVebA'
    });

    let clouds = L.OWM.clouds({showLegend: false, opacity: 0.5, appId: KEY});
    let precipitation = L.OWM.precipitation({showLegend: false,appId: `${KEY}`})
    map = L.map('mapid', { center: new L.LatLng(lat,lon), zoom: 12, layers: [osm] });
    let snow = L.OWM.snow({showLegend: false, appId: KEY});
    let temp = L.OWM.temperature({showLegend: false,opacity: 0.3, appId: KEY});
    let baseMaps = { "OSM Standard": osm };
    let overlayMaps = { "Clouds": clouds, "Precipitation": precipitation, "Snow": snow, "Temperature": temp };
    let layerControl = L.control.layers(baseMaps, overlayMaps   ).addTo(map);
}
const eventList = ['mouseup', 'mousedown']
for(evnt of eventList) {
    mapDiv.addEventListener(evnt, () => {
        let coords = map.getCenter();
        lat = coords.lat;
        lon = coords.lng;
        const url = `${proxy}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`
        getData(url);
    })
}

function setAttributes(el, attrs) {
    for(let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

async function getFiveDayForecast(lat,lon) {
    const url = `${proxy}https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`;
    let counter = 0;
    await fetch(url).then((result) => result.json()).then((result) => {
        console.log('----------One Call Weather Data----------');
        console.log(result);
       let forecast = result.daily;
       forecast.reverse();
       forecast.forEach(item => {
           let time = item.dt;
           let itemDate = new Date(time * 1000);
           let iconId = item.weather[0].icon;
           let iconElement = document.createElement('OBJECT');
           setAttributes(iconElement,{"type": "image/svg+xml", "width": "50px","height": "50px","data": `./icons/${iconId}.svg`});
           let row = fiveDayForecastTable.insertRow(counter);
           let dateCell = row.insertCell(0);
           let condCell = row.insertCell(1);
           let highCell = row.insertCell(2);
           let lowCell = row.insertCell(3);
           let iconCell = row.insertCell(4);

           highCell.setAttribute('style','color: #FF4949');
           lowCell.setAttribute('style','color: #0F4392');
           condCell.setAttribute('style','text-align: left');
           dateCell.innerHTML = itemDate.toLocaleDateString('en-us',options);
           condCell.innerHTML = item.weather[0].main;
           highCell.innerHTML = Math.floor(item.temp.max.toLocaleString());
           lowCell.innerHTML = Math.floor(item.temp.min.toLocaleString())
           iconCell.appendChild(iconElement);

       })
    });
}