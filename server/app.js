var express = require('express');
var logger = require('morgan');
var routes = require('./routes');
var ip = process.env.IP || "127.0.0.1";
var port = process.env.PORT || 3000;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session')
var app = express();
var redis = require('redis')
var client = redis.createClient();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var db = require('./db')


//Configure Express using Sessions and Cookies
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.static("../client/"));
app.use(cookieParser());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: "Secret",
    cookie: {
      maxAge: 1000*60*60
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());


//Set the Strategies to be Initialized for use as Middleware
//Using passport.authenticate("facebook") as middleware in a route will employ this FacebookStrategy
passport.use(new FacebookStrategy({
  clientID: '1416386561985917',
  clientSecret: '03dbd3a3d3d2e927ad479dcd7f661756',
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, done) {
  //Facebook sends back the profile information
  //Check if User already exists in DB
  db.FbUsers.findOne({fbId: profile.id}, function(err, oldUser) {
    //User Exists, so don't overwrite. Continue with Old User.
    if (oldUser) {
      done(null, oldUser);
    } else {
      console.log(profile)
      //User didn't Exist, make new User and Continue with it
      var newUser = new db.FbUsers({
        fbId: profile.id,
        email : profile.emails[0].value,
        name: profile.displayName
      }).save(function(err, newUser) {
        if(err) throw err;
        done(null, newUser);
      });
    }
  });
}
));

passport.serializeUser(function(user,done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.FbUsers.findById(id, function(err, user) {
    if (err) done (err);
    if(user) {
      done(null, user);
    } 
  })
})


//OAUTH ROUTES

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', { scope : "email"}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/app',
                                      failureRedirect: '/' }));

//Page and Logout Routes
app.get('/', function(req, res){
  if (!req.isAuthenticated()) {
    res.render('index', { user: req.user });
  } else {
    res.sendfile('app.html',{root: './../client/', user: req.user })
 }
});

app.get('/account', ensureAuthenticated, function(req, res){
  console.log(req.user)
  res.render('account', { user: req.user });
});

app.get('/app', ensureAuthenticated, function(req, res){
  res.sendfile('app.html', { root: './../client/', user: req.user });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//Data Routes
app.post('/addFriend', routes.addFriend);
app.post('/deleteFriend', routes.deleteFriend);
app.get('/getAllFriends', routes.getAllFriends);
app.post('/sendText', routes.sendText);
app.post('/increaseHealth', routes.increaseHealth);


//Authentication Helper Function
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

//Listen
app.listen(3000);
console.log('listening on port 3000')

