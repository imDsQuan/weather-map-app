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

//Socket IO
const app = express();

const server = require('http').createServer(app);
server.listen(3000);
const io = require('socket.io')(server);
var mangUS = []
io.on('connection', client => {
    console.log(client.id + "Đã kết nối");
    client.on('Client_send_pos', (data) => {
        mangUS.push(data);
        console.log(data);
        client.emit('send_mang_pos', mangUS);
    })

});
io.listen(server);



//app.listen(3000, () => console.log('listening at 3000'));
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
                    const api_url = `https://api.openweathermap.org/data/2.5/onecall?lat=${weathers[i].lat}&lon=${weathers[i].lng}&exclude=hourly,current,minutely,alerts&appid=d12a9593d6ac6bb9a3d411702d0ce789`;
                    fetch(api_url)
                        .then(res => res.json())
                        .then(json => {
                            console.log(weathers[i]._id);
                            Weather.findOne({ "_id": weathers[i]._id }, function(err, weathers) {
                                weathers.temp = (json.daily[0].temp.day - 273.15).toString();
                                weathers.humidity = (json.daily[0].humidity).toString();
                                weathers.cloud = (json.daily[0].clouds).toString();
                                weathers.wind_speed = (json.daily[0].wind_speed).toString();
                                weathers.min = (json.daily[0].temp.min - 273.15).toString();
                                weathers.max = (json.daily[0].temp.max - 273.15).toString();
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

app.get('/weather/history', (req, res) => {
    // const latlon = res.params.latlon.split(',');
    var lat = req.query.lat;
    console.log(lat)
    var lon = req.query.lon;
    console.log(lon)


    var dateNow = new Date();
    var previousOneDate = (new Date(Date.now() - 86400000).getTime() / 1000).toFixed(0);
    var previousTwoDate = (new Date(Date.now() - 86400000 * 2).getTime() / 1000).toFixed(0);
    var previousThreeDate = (new Date(Date.now() - 86400000 * 3).getTime() / 1000).toFixed(0);
    var previousFourDate = (new Date(Date.now() - 86400000 * 4).getTime() / 1000).toFixed(0);
    var previousFiveDate = (new Date(Date.now() - 86400000 * 5).getTime() / 1000).toFixed(0);

    var historyDate = [];
    historyDate.push(previousOneDate);
    historyDate.push(previousTwoDate);
    historyDate.push(previousThreeDate);
    historyDate.push(previousFourDate);
    historyDate.push(previousFiveDate);

    // console.log(historyDate);

    let responses = [];
    let array = new Array;
    for (let i = 0; i < 5; i++) {
        console.log(historyDate[i])
        responses.push(fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${historyDate[i]}&appid=d12a9593d6ac6bb9a3d411702d0ce789`)
            .then(res => res.json())
            .then(res => {
                array.push(res);
            }))
    }

    Promise.all(responses).then(function() {
        res.json(array);
    });
})