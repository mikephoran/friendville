var express = require('express');
var logger = require('morgan');
var routes = require('./routes');
var ip = process.env.IP || "127.0.0.1";
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var app = express();
var redis = require('redis')
var client = redis.createClient();


//Middleware
// Log Requests
app.use(logger('dev'));
//Parse Requests
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({extended: false}));
//Serve static files
app.use(express.static("../client/"));


//All other Routes
app.post('/addFriend', routes.addFriend);
app.post('/deleteFriend', routes.deleteFriend);
app.get('/getAllFriends', routes.getAllFriends);
app.post('/sendText', routes.sendText);
app.post('/increaseHealth', routes.increaseHealth);



//Listen
app.listen(3000);
console.log('listening on port 3000')

