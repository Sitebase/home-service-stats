var express = require('express');
var mqtt = require('mqtt');
var logs = [];

// Express page
var app = express();
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.get('/', function(request, response) {
    response.send('stats service running: <br />' + logs.join('<br />'));
});
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});

////////////////// MQTT listener
var mqttClient  = mqtt.connect('mqtt://192.168.1.116');
mqttClient.on('connect', function(){
    mqttClient.subscribe('home/#');
});
mqttClient.on('message', function (topic, message) {
    var data = JSON.parse(message);
    logs.push(topic);
    console.log(topic, data);
});
