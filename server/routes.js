var fbUser = require('./db').fbUser
var accountSid = "ACb96552b64852d2beafcab1c90c0fdec2";
var authToken = "461c2758cdb74058700561e4ee45776a";
var twilio = require('twilio')(accountSid, authToken);
var https = require('https');
var appID = "1416386561985917"
var clientToken = "4c80ae0d6944869c502d2cdab242ff4c";
var request = require('request');
var querystring = require('querystring');

var CONSUMER_KEY =  '76G7VV685T4jVeeiAczt2rN0e'
var CONSUMER_SECRET = '81LeVeP0zvcMjY1u60vwWCfG7ffL5VKu0KtroCPL8eHdiIyg5K'

exports.addFriend = function(req, res) {
  var fbId = req.body.fbId
  var name = req.body.name;
  var phone = req.body.phone;
  var image = req.body.img;
  var health = req.body.health;

  var user = req.user;

  //Find the Logged In User by ID
  fbUser.findById(user._id, 'friends', function (err, fbuser) {

    //Modify that User's friends object
    fbuser.friends[fbId] = {
      name: name,
      phone: phone,
      image: image,
      health: health
    };

    //Flag the model as modified for saving purposes
    fbuser.markModified('friends');
    
    //Save the User Model and Respond to Client
    fbuser.save(function() {
      res.status(200).end();
    });
    
  })
 
 //DEPRECATED REDIS VERSION
  // client.hmset(name, 'name', name, 'phone', phone, 'img', img, 'importance', importance, 'health', health, function(error, result) {
  //   if (error) {
  //     console.log('Error adding friend!');
  //   } else {
  //     console.log('Friend succesfully added, here are the details: ' + result);
  //     res.status(200).end();
  //   }
  // });
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
  
  //DEPRECATED REDIS VERSION
  // client.del(name, function(error, result) {
  //   if (error) {
  //     console.log('Error deleting friend!');
  //   } else {
  //     console.log(result + ' entries were deleted!')
  //     res.status(200).end();
  //   }
  // })
}

exports.getAllFriends = function(req, res) {
  var user = req.user;
  
  //Find the Logged In User by ID and send friends object
  fbUser.findById(user._id, 'friends', function (err, fbuser) {
    res.send(fbuser.friends);
  })
  
  //DEPRECATED REDIS VERSION
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

  // DEPRECATED REDIS VERSION
  // client.hincrby(name, 'health', 10*importance, function(error, result) {
  //   if (error) {
  //     res.status(400).send(error)
  //   } else {
  //     res.status(200).end();
  //   }
  // })
}

exports.pullFBFriendsList = function(clientreq, clientres) {

  var options = {
    hostname: 'graph.facebook.com',
    method: 'GET',
    path: '/v2.2/me/taggable_friends?access_token=' + clientreq.user.accessToken
  }

  //Start Request
  var req = https.request(options, function(res) {
  });

    //When request gets response:
    req.on('response', function (response) {
      
      var data = "";
      
      //Data response means add to data variable
      response.on('data', function (chunk) {
        data += chunk;
      });
      
      //End response means data collected, send back to client
      response.on('end', function(){
        clientres.send(data).end()
      });

    });

    //When it gets back Error, then console log it
    req.on('error', function(e) {
      console.error(e);
    });

    //Finishes sending the Request
    req.end();
}

exports.pullTwitterFriendsList = function(clientreq, clientres) {
  
  console.log('Twitter Token Secret', clientreq.user.twitterTokenSecret);
  var data = querystring.stringify({
    user_id: clientreq.user.twitterID
  })
  
  
  var url  = 'https://api.twitter.com/1.1/friends/list.json';
  var oauth = {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
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
    console.log(body);
    console.log(res.statusCode)
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
    console.log(body)
    console.log(res.statusCode)
  })
}

exports.updateImage = function(req,res) {
  var user = req.user;
  var fbId = req.body.fbId;
  var image = req.body.image;

  fbUser.findOne(user._id, 'friends', function(err, fbuser) {
    if (err) {
      res.status(400).send(error);
    } else {
      fbuser.friends[fbId].image =  image;
      fbuser.markModified('friends');
      fbuser.save();
      res.status(200).end();
    }
  });
}






//DEPRECATED FUNCTIONS FOR REFERENCE
//
//----------------------------
//tagInFBPOST - HTTP Module Version
//----------------------------
// 
// exports.tagInFBPost= function(clientreq, clientres) {
  
//   var message = clientreq.body.message;
//   var fbID = clientreq.body.fbID;
   
//   var options = {
//     hostname: 'graph.facebook.com',
//     method: 'POST',
//     path: '/v2.2/me/feed?access_token=' + clientreq.user.accessToken + '&' + 'message=' + message + '&' + 'place=195383960551614' + '&' + 'tags=' + fbID
//   }
  
//   //Start Request
//   var req = https.request(options, function(res) {
//   });

//     //When request gets response:
//     req.on('response', function (response) {
      
//       var data = "";
      
//       //Data response means add to data variable
//       response.on('data', function (chunk) {
//         data += chunk;
//       });
      
//       //End response means data collected, send back to client
//       response.on('end', function(){
//         clientres.send(data).end()
//       });

//     });

//     //When it gets back Error, then console log it
//     req.on('error', function(e) {
//       console.error(e);
//     });

//     //Finishes sending the Request
//     req.end();

// }
