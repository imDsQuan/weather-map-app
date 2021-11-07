const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Weather = new Schema({
    city: { type: 'string' },
    lat: { type: 'string' },
    lng: { type: 'string' },
    temp: { type: 'string' },
    humidity: { type: 'string' },
    cloud: { type: 'string' },
    wind_speed: { type: 'string' },
    min: { type: 'string' },
    max: { type: 'string' },
    rain: { type: 'string' },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Weather', Weather);