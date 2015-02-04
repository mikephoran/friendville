var fbUser = require('./db').fbUser
var request = require('request');
var querystring = require('querystring');
var childProcess = require('child_process');
var config = require('./config');
var twilio = require('twilio')(config.accountSid, config.authToken);

exports.logoutTwitter = function(req, res) {
  fbUser.findById(req.user._id, 'twitterID', function (err, fbuser) {
    fbuser.twitterID = ''
    fbuser.save(function() {
      res.redirect('/')
    })
  })
}

exports.addFriend = function(req, res) {
  //Find the Logged In User by ID
  fbUser.findById(req.user._id, 'friends', function (err, fbuser) {

    //Modify that User's friends object
    fbuser.friends[req.body.fbId] = {
      twitterID: req.body.twitterID,
      twitterName: req.body.twitterName,
      name: req.body.name,
      phone: req.body.phone,
      image: req.body.image,
      health: req.body.health
    };

    //Flag the model as modified for saving purposes
    fbuser.markModified('friends');

    //Save the User Model and Respond to Client
    fbuser.save(function() {
      res.status(200).end();
    });
  })
};

exports.deleteFriend = function(req, res) {
  var fbId= req.body.fbId;
  var user = req.user;
  
  //Find the Logged In User by ID
  fbUser.findById(user._id, 'friends', function (err, fbuser) {
    
    //Delete the friend via fbId from the Friends obj
    delete fbuser.friends[fbId];
    
     //Flag the model as modified for saving purposes
    fbuser.markModified('friends');
    
    //Save the User Model and Respond to Client
    fbuser.save(function() {
      res.status(200).end();
    });
  })
}

exports.getAllFriends = function(req, res) {
  fbUser.findById(req.user._id, 'friends', function (err, fbuser) {
    res.send(fbuser.friends);
  })
} 

exports.sendText = function(req, res) {
  twilio.messages.create(
  {
    body: req.body.message,
    to: "+1" + req.body.phone.split(' ').join(),
    from: "+18053246030"
  }, 
  function(error, message) {
    if (error) {
      console.log('error sending text, error message: ', error.message);
      res.status(400).send(error.message);
    } else {
      console.log(message.body + " sent succesfully to " + message.to + ' from ' + message.from);
      res.status(200).end();
    }
  })
}

exports.increaseHealth = function(req, res) {
  var user = req.user;
  var fbId = req.body.fbId;
  var amount = req.body.amount;

  fbUser.findOne(user._id, 'friends', function(err, fbuser) {
    if (err) {
      res.status(400).send(error);
    } else {
      fbuser.friends[fbId].health =  fbuser.friends[fbId].health+ amount;
      fbuser.markModified('friends');
      fbuser.save();
      res.status(200).end();
    }
  });
}

exports.pullFBFriendsList = function(req, res) {
  
  var options = {
        url: 'https://graph.facebook.com/v2.2/me/taggable_friends',
        qs: {
          access_token: req.user.accessToken
        }
      }
      
  var pullerChild = childProcess.fork("./friendpuller")
  
  pullerChild.send(options)
  
  pullerChild.on('message', function(data) {
    if (data.err) {
      res.status(400).send(data.err);
      return
    }
    res.status(200).send(data.content)
    return
  })
}

exports.pullTwitterFriendsList = function(clientreq, clientres) {

  var url  = 'https://api.twitter.com/1.1/friends/list.json';
  var oauth = {
    consumer_key: config.CONSUMER_KEY,
    consumer_secret: config.CONSUMER_SECRET,
    token: clientreq.user.twitterToken,
    token_secret: clientreq.user.twitterTokenSecret
  }
  var qs = {
    user_id: clientreq.user.twitterID
  }
  
  request.get({url: url, oauth: oauth, qs: qs, json: true}, function(err, res, body) {
    if (err) {
      console.log('Error pulling Twitter friends list:', err)
      clientres.status(res.statusCode).send(err)
      return
    }
    clientres.status(res.statusCode).send(body);
    console.log('successfully pulled twitter friends list')
    return
  })
}

exports.tagInFBPost= function(clientreq, clientres) {
  var message = clientreq.body.message;
  var fbID = clientreq.body.fbID;
  var data = querystring.stringify({access_token: clientreq.user.accessToken, message: message, place: '195383960551614', tags: fbID})

  var options = {
    uri: 'https://graph.facebook.com/v2.2/me/feed',
    body: data
  }

  request.post(options, function(err, res, body) {
    if (err) {
      console.log ('tagInFBPost Error: ', err)
      clientres.status(res.statusCode).send(err);
      return
    }
    clientres.status(res.statusCode).send(body);
  })
}

exports.checkTwitterAccount = function(req, res) {
  if (req.user.twitterID) {
    res.status(200).send(true)
  } else {
    res.status(200).send(false)
  }
}

exports.sendTwitterMessage = function(clientreq, clientres) {

  var url  = 'https://api.twitter.com/1.1/direct_messages/new.json';
  var oauth = {
    consumer_key: config.CONSUMER_KEY,
    consumer_secret: config.CONSUMER_SECRET,
    token: clientreq.user.twitterToken,
    token_secret: clientreq.user.twitterTokenSecret
  }
  var qs = {
      user_id: clientreq.body.twitterID,
      text: clientreq.body.message
  }
  request.post({url: url, oauth: oauth, qs: qs, json: true}, function(err, res, body) {
    if (err) {
      console.log('Error sending Twitter Message: ', err)
      clientres.status(res.statusCode).send(err)
      return
    }
    clientres.status(res.statusCode).send(body);
    console.log('Successfully sent Twitter Message');
    return
  })
}

exports.tagInTweet = function(clientreq, clientres) {
  var url  = 'https://api.twitter.com/1.1/statuses/update.json';
  var oauth = {
    consumer_key: config.CONSUMER_KEY,
    consumer_secret: config.CONSUMER_SECRET,
    token: clientreq.user.twitterToken,
    token_secret: clientreq.user.twitterTokenSecret
  }
  var qs = {
      status: clientreq.body.message
  }
  request.post({url: url, oauth: oauth, qs: qs, json: true}, function(err, res, body) {
    if (err) {
      console.log('Error tagging in tweet: ', err)
      clientres.status(res.statusCode).send(err)
      return
    }
    clientres.status(res.statusCode).send(body);
    console.log('Successfully tagged friend in tweet');
    return
  })
}




//DEPRECATED REDIS FUNCTIONS FOR REFERENCE

// exports.addFriend = function(req, res) {
//  client.hmset(name, 'name', name, 'phone', phone, 'img', img, 'importance', importance, 'health', health, function(error, result) {
//    if (error) {
//       console.log('Error adding friend!');
//     } else {
//      console.log('Friend succesfully added, here are the details: ' + result);
//      res.status(200).end();
//    }
//  });
//}

// exports.deleteFriend = function(req, res) {
  // client.del(name, function(error, result) {
  //   if (error) {
  //     console.log('Error deleting friend!');
  //   } else {
  //     console.log(result + ' entries were deleted!')
  //     res.status(200).end();
  //   }
  // })
// }

// exports.getAllFriends = function(req, res) {
  // client.keys('*', function(error, result) {
  //   var multi = client.multi();
  //   var total = result.length;
  //   var i = 0;
  //   if (total === 0) {
  //     res.send(allFriends);
  //     return;
  //   }
  //   result.forEach(function (key) {
  //       client.hgetall(key, function(error, result) {
  //         console.log('hgetall result: ', result);
  //         allFriends.push(result);
  //         i++;

  //         if (i === total) {
  //           res.send(allFriends);
  //           return;
  //         }
  //       })
  //   })
  // });
// } 

// exports.increaseHealth = function(req, res) {
  // client.hincrby(name, 'health', 10*importance, function(error, result) {
  //   if (error) {
  //     res.status(400).send(error)
  //   } else {
  //     res.status(200).end();
  //   }
  // })
// }


// DEPRECATED HTTPS MODULE FUNCTIONS FOR REFERENCE
