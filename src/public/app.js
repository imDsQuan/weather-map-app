state = {
    location: {
        x: null,
        y: null,
    }
}

var socket = io('https://8038-116-104-160-255.ngrok.io')

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
            L.marker(i).addTo(map)
                .bindPopup('We have someone down here ' + i.toString())
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

info.update = function(props) {
    this._div.innerHTML = '<h4>Weather Forecast</h4>' + (props ?
        '<b>' + props.Name + '</b><br />' + props.temperature + ' độ C' :
        'Hover over a state');
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
            console.log(cityData.features[i].properties.temperature)
        }
        return cityData;
    }).then(function(cityData) {
        var geojson;

        function resetHighlight(e) {
            geojson.resetStyle(e.target);
            info.update();
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
    })

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

    info.update(layer.feature.properties);
}



function zoomToFeature(e) {
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
            map.flyTo([kq.lat, kq.lon], 10)
            var city = kq.address.state ? kq.address.state : kq.address.city;
            L.marker([kq.lat, kq.lon]).addTo(map)
                .bindPopup(city)
                .openPopup();

        })
}