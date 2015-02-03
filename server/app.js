var express = require('express');
var logger = require('morgan');
var ip = process.env.IP || "127.0.0.1";
var port = process.env.PORT || 3000;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session')
var app = express();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var CONSUMER_KEY =  '76G7VV685T4jVeeiAczt2rN0e'
var CONSUMER_SECRET = '81LeVeP0zvcMjY1u60vwWCfG7ffL5VKu0KtroCPL8eHdiIyg5K'
//Require Friendville Modules
var routes = require('./routes');
var gamelogic = require('./gamelogic');
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

//Initialize Passport and Initialize Sessions for Passport
app.use(passport.initialize());
app.use(passport.session());


//Set the Strategies to be Initialized for use as Middleware
passport.use(new FacebookStrategy({
  clientID: '1416386561985917',
  clientSecret: '2f94f17d29c8289b00245b29ae45ba63',
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, done) {
  //Facebook sends back the profile information
  //Check if User already exists in DB

  db.fbUser.findOne({fbId: profile.id}, function(err, oldUser) {
    //User Exists, so don't overwrite. Continue with Old User.
    if (oldUser) {
      done(null, oldUser);
    } else {
      //User didn't Exist, make new User and Continue with it
      var newUser = new db.fbUser({
        fbId: profile.id,
        email : profile.emails[0].value,
        name: profile.displayName,
        accessToken: accessToken,
        refreshToken: refreshToken,
        friends: {}
      }).save(function(err, newUser) {
        if(err) throw err;
        done(null, newUser);
      });
    }
  });
}
));

passport.use(new TwitterStrategy({
  consumerKey: CONSUMER_KEY,
  consumerSecret: CONSUMER_SECRET,
  callbackURL: 'http://localhost:3000/auth/twitter/callback',
  passReqToCallback: true
},
function(req, token, tokenSecret, profile, done) {
  //Twitter sends back the profile information
  //Add Twitter Token Information to User Profile
  db.fbUser.findById(req.user._id, function(err, user) {
    if (err) {
      console.log('Error linking Twitter Account: ', err)
    } else {
      console.log('token and token secret', token, tokenSecret)
      user.twitterID = profile.id;
      user.twitterToken = token;
      user.twitterTokenSecret = tokenSecret;
      user.twitterPhoto = profile.photos[0].value;

      user.save(function(err, updatedUser) {
        if(err) throw err;
        done(null, updatedUser)
      })
    }
  })
}));



passport.serializeUser(function(user,done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.fbUser.findById(id, function(err, user) {
    if (err) done (err);
    if(user) {
      done(null, user);
    } 
  })
})


//OAUTH ROUTES

// Redirect the user to Facebook or Twitter for authentication.
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ["email", "user_friends", "publish_actions"]}));
app.get('/auth/twitter', passport.authorize('twitter'));

// Facebook or Twitter will redirect the user to this URL after approval.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/app',
                                      failureRedirect: '/' }));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/app',
                                      failureRedirect: '/account' }));

//Page and Logout Routes
app.get('/', function(req, res){
  if (!req.isAuthenticated()) {
    res.render('index', { user: req.user });
  } else {
    res.sendFile('app.html',{root: './../client/', user: req.user })
 }
});

app.get('/account', ensureAuthenticated, function(req, res){
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
app.get('/pullFBFriendsList', routes.pullFBFriendsList);
app.get('/pullTwitterFriendsList', routes.pullTwitterFriendsList);
app.post('/updateImage', routes.updateImage);
app.post('/tagInFBPost', routes.tagInFBPost);


//Authentication Helper Function
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

//Listen
app.listen(3000);
console.log('listening on port 3000')

