var map = L.map('map').setView([21.0245, 105.84117], 10);

var cityData;

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);


function getColor(d) {
    return d > 37.7 ? '#7E0001' :
        d > 30.2 ? '#0000fe' :
        d > 30 ? '#D80100' :
        d > 29.7 ? '#05f7f8' :
        d > 29.5 ? '#f46523' :
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

var numberCity = 63;


fetch('/weather/all')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data)
        let dateLength = data.length;
        for (let i = 0; i < dateLength; i++) {
            cityData.features[i].properties.temperature = data[i].temp;
            console.log(getColor(cityData.features[i].properties.temperature))
        }
        return cityData;
    }).then(function(cityData) {
        var geojson;
        L.geoJson(cityData, {
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
            onEachFeature: onEachFeature
        }).addTo(map);
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


function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}





console.log(cityData);