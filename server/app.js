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

//Require Friendville Modules
var config = require('./config');
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
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
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
  consumerKey: config.CONSUMER_KEY,
  consumerSecret: config.CONSUMER_SECRET,
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

//Passport serializes and deserializes User from DB to allow use of req.user
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
// Redirect the user to Facebook/Twitter for authentication.
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ["email", "user_friends", "publish_actions"]}));
app.get('/auth/twitter', passport.authorize('twitter'));

// Facebook/Twitter will redirect the user to this URL after approval.
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
app.get('/logoutTwitter', routes.logoutTwitter);
app.post('/addFriend', routes.addFriend);
app.post('/deleteFriend', routes.deleteFriend);
app.get('/getAllFriends', routes.getAllFriends);
app.get('/checkTwitterAccount', routes.checkTwitterAccount);
app.get('/pullFBFriendsList', routes.pullFBFriendsList);
app.get('/pullTwitterFriendsList', routes.pullTwitterFriendsList);
app.post('/sendText', routes.sendText);
app.post('/tagInFBPost', routes.tagInFBPost);
app.post('/tagInTweet', routes.tagInTweet);
app.post('/sendTwitterMessage', routes.sendTwitterMessage);
app.post('/increaseHealth', routes.increaseHealth);


//Authentication Helper Function
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

//Listen
app.listen(3000);
console.log('listening on port 3000')

