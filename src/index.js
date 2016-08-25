var express = require('express');
var mqtt = require('mqtt');
var ua = require('universal-analytics');

var logs = [];
var visitor = ua('UA-2072779-32');

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

    var symbol = data.symbol;
    var type = symbol.replace('House.', '').substring(0, 1);

    var category = null;
    var action = null;
    var label = symbol;

    switch(type) {
        case 'l':
            category = 'light';
            action = data.value === 1 ? 'on' : 'off';
            break;
        case 'b':
            category = 'button';
            action = data.value === 1 ? 'down' : 'up';
            break;
        case 'p':
            category = 'pump';
            action = data.value === 1 ? 'on' : 'off';
            break;
        case 'o':
            category = 'outlet';
            action = data.value === 1 ? 'on' : 'off';
            break;
        case 'm':
            category = 'motor';
            action = data.value === 1 ? 'on' : 'off';
            break;
        case 's':
            // only send event for movement
            category = data.value === 1 ? 'sensor' : null;
            action = 'movement';
            break;
    }

    if(category) {
        console.log('write to analytics', category, action, label);
        visitor.event(category, action, label).send();
    }
});
