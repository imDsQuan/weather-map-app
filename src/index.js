// import fetch from "node-fetch";
const express = require('express');
const mongoose = require('mongoose');
const db = require('./config/db');
const Weather = require('./model/Weather');
const { mutipleMongooseToObject } = require('./util/mongoose')
const { mongooseToObject } = require('./util/mongoose')
const fetch = require('node-fetch')

//Connect to db

db.connect();


const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('src/public'));

app.get('/weather/all', async function(req, res) {
    await Weather.find({})
        .then(weathers => {
            weathers = weathers.map(weather => weather.toObject());
            var today = new Date();
            var date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var updateDate = weathers[0].updatedAt.toLocaleString().slice(0, 9);
            if (!(updateDate == date)) {
                let length = weathers.length;
                for (let i = 0; i < length; i++) {
                    const api_url = `https://api.openweathermap.org/data/2.5/onecall?lat=${weathers[i].lat}&lon=${weathers[i].lng}&exclude=hourly,current,minutely,alerts&appid=a5c0f1936651c1c92862924ad953525e`;
                    fetch(api_url)
                        .then(res => res.json())
                        .then(json => {
                            console.log(weathers[i]._id);
                            Weather.findOne({ "_id": weathers[i]._id }, function(err, weathers) {
                                weathers.temp = (json.daily[0].temp.day / 10).toString();
                                weathers.humidity = (json.daily[0].humidity).toString();
                                weathers.cloud = (json.daily[0].clouds).toString();
                                weathers.wind_speed = (json.daily[0].wind_speed).toString();
                                weathers.min = (json.daily[0].temp.min / 10).toString();
                                weathers.max = (json.daily[0].temp.max / 10).toString();
                                weathers.rain = (json.daily[0].rain);
                                weathers.save();
                                if (err) throw err;
                            })
                        })
                }
            } else console.log("Not Update Weather Info");
        })
        .catch(error => console.error(error));
    await Weather.find({}).then(weathers => {
        weathers = weathers.map(weather => weather.toObject());
        res.json(weathers);
    })


})