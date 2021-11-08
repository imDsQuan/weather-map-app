state = {
    location: {
        x: null,
        y: null,
    }
}

var socket = io('https://3e05-116-104-160-255.ngrok.io')

var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [25, 50],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});

//var humanIcon = new LeafIcon({ iconUrl: 'human.png' })

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



var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};


var dateNow = new Date();
var previousOneDate = getDateMonth((new Date(Date.now() - 86400000)))
var previousTwoDate = getDateMonth((new Date(Date.now() - 86400000 * 2)))
var previousThreeDate = getDateMonth((new Date(Date.now() - 86400000 * 3)))
var previousFourDate = getDateMonth((new Date(Date.now() - 86400000 * 4)))
var previousFiveDate = getDateMonth((new Date(Date.now() - 86400000 * 5)))

function getDateMonth(dateObj) {
    return (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear();
}


info.update = async function(props) {
    console.log(previousOneDate)
    const api_url = `weather/history/?lat=${props.lat}&lon=${props.lon}`;
    const response = await fetch(api_url);
    const json = await response.json();
    console.log(json);
    this._div.innerHTML = await '<h4>Weather Forecast</h4>' + (props ?
        ' <b>' + props.Name + '</b><br /> Temperature: ' + props.temperature + ' <span>&#8451;</span>' +
        '<br>History weather: <br>' +
        previousOneDate + ': Temperature: ' + (json[0].current.temp - 273.15).toFixed(2) + '<br>' +
        previousTwoDate + ': Temperature: ' + (json[1].current.temp - 273.15).toFixed(2) + '<br>' +
        previousThreeDate + ': Temperature: ' + (json[2].current.temp - 273.15).toFixed(2) + '<br>' +
        previousFourDate + ': Temperature: ' + (json[3].current.temp - 273.15).toFixed(2) + '<br>' +
        previousFiveDate + ': Temperature: ' + (json[4].current.temp - 273.15).toFixed(2) + '<br>' :
        'Click on a state');
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
        temps = [-3.9, -1.2, 1.6, 4.3, 9.9, 12.7, 15.5, 18.2, 21, 23.8, 26.6, 29.3, 32.1, 34.9, 37.7, ],
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
            var city = kq.address.state ? kq.address.state : kq.address.city;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${kq.lat}&lon=${kq.lon}&exclude=hourly,current,minutely,alerts&appid=a5c0f1936651c1c92862924ad953525e`)
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    map.flyTo([kq.lat, kq.lon], 10)
                    var temp = (json.daily[0].temp.day - 273.15).toFixed(1);
                    var eve = (json.daily[0].feels_like.day - 273.15).toFixed(1);

                    console.log(temp);
                    L.marker([kq.lat, kq.lon]).addTo(map)
                        .bindPopup(`<h3> ${city} <h3>
                        <p style="font-weight:400">Temperature: ${temp} <span>&#8451;</span>
                        <br>Feels Like: ${eve} <span>&#8451;</span>
                        </p>`)
                        .openPopup();
                })
        })
}