state = {
    location: {
        x: null,
        y: null,
    }
}

// var socket = io('https://bfee-116-104-160-255.ngrok.io')

var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [25, 50],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});

var humanIcon = new LeafIcon({ iconUrl: 'human.png' })

navigator.geolocation.getCurrentPosition((pos) => {
    this.state = {
        location: {
            x: pos.coords.latitude,
            y: pos.coords.longitude,
        }
    }

    var position = [this.state.location.x, this.state.location.y]
    socket.emit('Client_send_pos', position)
    socket.on('send_mang_pos', (data) => {
        data.forEach(i => {
            console.log(i)
            L.marker(i, ).addTo(map)
                .bindPopup('We have someone here <br> Coordinates: ' + i.toString())
                .openPopup();
        })
    })


});


var map = L.map('map').setView([21.0245, 105.84117], 8);

var cityData;

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 20,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);



function getColor(d) {
    return d > 37.7 ? '#7e0001' :
        d > 34.9 ? '#9a0000' :
        d > 32.1 ? '#d80100' :
        d > 29.3 ? '#fd0000' :
        d > 26.6 ? '#f46523' :
        d > 23.8 ? '#ff9e07' :
        d > 21 ? '#ffd728' :
        d > 18.2 ? '#ffff01' :
        d > 15.5 ? '#cdff00' :
        d > 12.7 ? '#80ff00' :
        d > 9.9 ? '#3ab54a' :
        d > 4.3 ? '#05f7f8' :
        d > 1.6 ? '#017eff' :
        d > -1.2 ? '#0000fe' :
        d > -3.9 ? '#1b1464' :
        '#662e93';
}



var info = L.control({ position: 'bottomleft' });

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = `<h4>Weather Forecast</h4>Click on the state`;
    return this._div;
};


var dateNow = getDateMonth(new Date(Date.now()));
var previousOneDate = getDateMonth((new Date(Date.now() - 86400000)))
var previousTwoDate = getDateMonth((new Date(Date.now() - 86400000 * 2)))
var previousThreeDate = getDateMonth((new Date(Date.now() - 86400000 * 3)))
var previousFourDate = getDateMonth((new Date(Date.now() - 86400000 * 4)))
var previousFiveDate = getDateMonth((new Date(Date.now() - 86400000 * 5)))

var historyDate = [];

historyDate.push(previousOneDate);
historyDate.push(previousTwoDate);
historyDate.push(previousThreeDate);
historyDate.push(previousFourDate);
historyDate.push(previousFiveDate);


function getDateMonth(dateObj) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dateObj.getDay()] + ' ' + (dateObj.getDate()) + '/' + (dateObj.getMonth() + 1);
}


info.update = async function(props) {
    const api_url = `weather/history/?lat=${props.lat}&lon=${props.lon}`;
    const response = await fetch(api_url);
    const json = await response.json();
    console.log(json);
    var weatherHistoryInfo = await '';
    for (let i = 4; i >= 0; i--) {
        weatherHistoryInfo += `
    <div class="widget history">
        <div class="left left-history">
            <img src="animated/cloudy-day-2.svg" class="icon" alt="">
            <h5 class="weather-date">${historyDate[i]}</h5>
        </div>
        <div class="bottom">
            <div>
                Temperature<span>${(json[i].current.temp -273.5).toFixed(1)}&#176;C</span>
                <span style="font-size:0.9em">Humidity: ${json[i].current.humidity}%</span>
            </div>
        </div>
    </div>`;
    }

    var weatherStateInfo = `
        <div class="widget">
            <div class="left">
                <img src="animated/cloudy-day-2.svg" class="icon" alt="">
                <h5 class="weather-date">${dateNow}</h5>
            </div>
            <div class="right">
                <h5 class="city">${props.Name}</h5>
                <h5 class="degree">${props.temperature}&#176;C</h5>
            </div>
            <div class="bottom">
                <div>
                    Wind Speed<span>${props.wind_speed} kmph</span>
                </div>

                <div>
                    Cloud Cover <span>${props.cloud}%</span>
                </div>

                <div>
                    Min <span>${props.min}&#176;C</span>
                </div>

                <div>
                    Max <span>${props.max}&#176;C</span>
                </div>
            </div>
        </div>`;

    var weatherInfo = await `<div class="container">${weatherHistoryInfo} ${weatherStateInfo}</div> `


    this._div.innerHTML = await weatherInfo;
};




info.addTo(map);



fetch('/weather/all')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data)
        let dateLength = data.length;
        for (let i = 0; i < dateLength; i++) {
            cityData.features[i].properties.temperature = parseFloat(data[i].temp).toFixed(1).toString();
            cityData.features[i].properties.humidity = parseFloat(data[i].humidity).toFixed(1).toString();
            cityData.features[i].properties.min = parseFloat(data[i].min).toFixed(1).toString();
            cityData.features[i].properties.max = parseFloat(data[i].max).toFixed(1).toString();
            cityData.features[i].properties.rain = parseFloat(data[i].rain).toFixed(1).toString();
            cityData.features[i].properties.cloud = parseFloat(data[i].cloud).toFixed(1).toString();
            cityData.features[i].properties.wind_speed = parseFloat(data[i].wind_speed).toFixed(1).toString();
            cityData.features[i].properties.lat = parseFloat(data[i].lat);
            cityData.features[i].properties.lon = parseFloat(data[i].lng);
        }
        return cityData;
    }).then(function(cityData) {
        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
        }

        geojson = L.geoJson(cityData, {
            style: function(features) {
                return {
                    fillColor: getColor(features.properties.temperature),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(features, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }
        }).addTo(map);

        console.log(geojson);

        var button = document.getElementById('search-btn');

        button.onclick = handleSearch;
        input.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                button.click();
            }
        });
    })

var input = document.getElementById("search-txt");


function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }


}



function zoomToFeature(e) {
    var layer = e.target;
    map.fitBounds(e.target.getBounds());
    console.log(e.target.getBounds());
    info.update(layer.feature.properties);

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
        temps = [12.7, 15.5, 18.2, 21, 23.8, 26.6, 29.3, 32.1, 34.9, 37.7, ],
        labels = [],
        from, to;

    for (var i = 0; i < temps.length; i++) {
        from = temps[i];
        to = temps[i + 1];

        labels.push(
            '<div style="background:' + getColor(from + 1) + '"></div> ' +
            from + ' ' + '<span>&#8451;</span>' + (to ? ' - ' + to + ' ' + '<span>&#8451;</span>' : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);



function handleSearch() {
    var query = document.getElementById('search-txt').value;
    fetch('https://nominatim.openstreetmap.org/search?format=json&polygon=1&addressdetails=1&q=' + query)
        .then(result => result.json())
        .then(res => {
            console.log(res);
            var kq = res.find(element => element.address.country_code === 'vn');
            console.log(kq);
            var city = kq.address.city_district ? kq.address.city_district :
                kq.address.county ? kq.address.county :
                kq.address.city ? kq.address.city :
                kq.address.town ? kq.address.town : kq.address.state;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${kq.lat}&lon=${kq.lon}&exclude=hourly,current,minutely,alerts&appid=e787e70d0a2acf9d2fb7a5289aff51f6`)
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    map.flyTo([kq.lat, kq.lon], 10)
                    var temp = (json.daily[0].temp.day - 273.15).toFixed(1);
                    var eve = (json.daily[0].feels_like.day - 273.15).toFixed(1);

                    console.log(temp);
                    var cityMarker = L.marker([kq.lat, kq.lon]).addTo(map)
                        .bindPopup(`<h3> ${city} <h3>
                        <p style="font-weight:400">Temperature: ${temp} <span>&#8451;</span>
                        <br>Feels Like: ${eve} <span>&#8451;</span>
                        </p>`)
                        .openPopup();
                    map.eachLayer(function(layer) {
                        console.log(layer);
                        console.log(layer._leaflet_id);
                    })


                    console.log("Marker id: " + cityMarker._leaflet_id);

                })
        })
}