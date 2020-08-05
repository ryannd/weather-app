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
const dateHeader = document.getElementById('date-header')
let iconId;
let lat;
let lon;
let getCoords = new XMLHttpRequest();
let map;

window.addEventListener('load', () => {
    setWelcomeMessage();
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;

            const url = `${proxy}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`
            getData(url);
            setWeatherMap(lat,lon);
        });
    }
    else {
        alert('Please enable location access to use this service');
    }
});

async function getData(url) {
    await fetch(url).then((result) => result.json()).then((result) => {
        if(result.name === undefined){
            loc.innerHTML = "Location not found!";
            temp.style.display = "none";
            cond.style.display = "none";
            icon.style.display = "none";
        }
        else {
            console.log(result);
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
    let search = document.getElementById('searchtext').value;
    fetch(`http://open.mapquestapi.com/geocoding/v1/address?key=${mapKey}&location=${search}`)
        .then(response => response.json())
        .then(data => {
            lon = data.results[0].locations[0].latLng.lng;
            lat = data.results[0].locations[0].latLng.lat;
            const url = `${proxy}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`;
            getData(url);
            map.flyTo(new L.LatLng(lat,lon), {animate: true});
            loc.innerHTML = data.results[0].providedLocation.location;

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
    let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    let gl = L.mapboxGL({
        accessToken: '{token}',
        style: `${proxy}https://github.com/openmaptiles/dark-matter-gl-style/blob/master/style.json`
    }).addTo(map);
}