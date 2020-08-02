const KEY = '224abafba9a42c52d67874bb58898374';

const loc = document.getElementById('location');
const temp = document.getElementById('temperature');
const cond = document.getElementById('conditions');
const searchButton = document.getElementById('searchbutton');
const searchText = document.getElementById('searchtext');
let lat;
let lon;

window.addEventListener('load', () => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            const proxy = 'https://cors-anywhere.herokuapp.com/'
            const url = `${proxy}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=imperial`
            getData(url);
        });
    }
    else {
        alert('Please enable location access to use this service');
    }

});

async function getData(url) {
    await fetch(url).then((result) => result.json()).then((result) => {
        console.log(result);
        loc.innerHTML = result.name;
        temp.innerHTML = result.main.temp;
        cond.innerHTML = result.weather[0].main;
    })
}

searchButton.addEventListener('click', () => {
    let userSearch = searchText.value;
    let zipCodeTest = /\d/g;
    let url;
    if(zipCodeTest.test(userSearch)){
        url = `https://api.openweathermap.org/data/2.5/weather?zip=${userSearch}&appid=${KEY}&units=imperial`;
        getData(url);
    }
    else {

    }
})
