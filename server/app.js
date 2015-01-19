var express = require('express');
var logger = require('morgan');
var routes = require('./routes');
var ip = process.env.IP || "127.0.0.1";
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var app = express();
var redis = require('redis')
var client = redis.createClient();
var oauth2lib = require('./oauth20-provider.js');
var oauth2 = new oauth2lib({log: {level: 2}});
var session = require('express-session');
var cookieParser = require('cookie-parser')

//Middleware
// Log Requests
app.use(logger('dev'));
//Parse Requests
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({extended: false}));
//Serve static files
app.use(express.static("../client/"));
//Oath
server.use(session({ secret: 'oauth20-provider-test-server', resave: false, saveUnitialized: false}));
server.use(oauth2.inject());

// Views
server.set('views', './view');
server.set('view engine', 'jade');


//MiddleWare Function for Oauth
function isAuthorized(req, res, next) {
  if (req.session.authorized) {
    next();
  } else {
    var params = req.query;
    params.backUrl = req.path;
    res.redirect('/login?' + query.stringify(params));
  }
}

//OAuth Authorization EndPoint
server.get('/authorization', isAuthorized, oauth2.controller.authorization, function(req, res) {
  res.render('authorization', {layout: false});
});
server.post('authorization', isAuthorized, oauth2.controller.authorization);

//OAuth Token Endpoint
server.post('/token', oauth2.controller.token);

//Login Routes
server.get('/login', function(req, res) {
  res.render('login', {layout: false});
})

server.post('/login', function(req, res, next) {
  var backUrl = req.query.backUrl ? req.query.backUrl : '/';
  delete(req.query.backUrl);
  backUrl+= BackUrl.indexOf('?') > -1 ? '&' : '?';
  backUrl = += query.stringify(req.query);

  //Already Logged In
  if (req.session.authorized) {
    res.redirect(backUrl) 
  } 
  //Trying to Log in
  else if (req.body.username && req.body.password) {
    model.oauth2.user.fetchByUsername(req.body.username, function(err, valid) {
      if (err) {
       next(err);
      } else if (!valid) {
       res.redirect(req.url);
      } else {
       req.session.user = user;
       req.session.authorized = true;
       res.redirect(backUrl);
      }
    }); 
  }
//please login
  else {
    res.redirect(req.url)
  }
})

//All other Routes
app.post('/addFriend', routes.addFriend);
app.post('/deleteFriend', routes.deleteFriend);
app.get('/getAllFriends', routes.getAllFriends);
app.post('/sendText', routes.sendText);
app.post('/increaseHealth', routes.increaseHealth);

//Incrementally Decrement Friend Health
var decrementSpeed = 1000 *  10;  //Loses 1 health every 10 seconds for demonstration purposes

var globalDecrement = function() {
  console.log('Begin Global Decrement')
  client.keys('*', function(error, result) {
    var multi = client.multi();
    var total = result.length;
    var i = 0;

    if (total === 0) {
      return;
    }

    result.forEach(function (key) {

      var currentkey = key;

      client.hget(currentkey, 'health', function(error, result) {
        
        if (result > 0) {
         
          client.hincrby(key, 'health', -1, function(error, result) {
            i++;
            if (i === total) {
              console.log('Global Decrement Complete')
              return;
            } 
          })
        } else {
          i++;
          if (i === total) {
            console.log('Global Decrement Complete')
            return;
          } 
        }
      })
    })
  })
}

setInterval(globalDecrement, decrementSpeed);

//Listen
app.listen(3000);
console.log('listening on port 3000')

