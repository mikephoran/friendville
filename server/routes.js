// var redis = require('redis')
// var client = redis.createClient();
var fbUser = require('./db').fbUser
var accountSid = "ACb96552b64852d2beafcab1c90c0fdec2";
var authToken = "461c2758cdb74058700561e4ee45776a";
var twilio = require('twilio')(accountSid, authToken);
var https = require('https');
var appID = "1416386561985917"
var clientToken = "4c80ae0d6944869c502d2cdab242ff4c";

exports.addFriend = function(req, res) {
  var fbId = req.body.fbId
  var name = req.body.name;
  var phone = req.body.phone;
  var img = req.body.img;
  var health = req.body.health;

  var user = req.user;

  //Find the Logged In User by ID
  fbUser.findById(user._id, 'friends', function (err, fbuser) {
    console.log('fbuser:', fbuser.friends)

    //Modify that User's friends object
    fbuser.friends[fbId] = {
      name: name,
      phone: phone,
      image: img,
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
    console.log('fbid:', fbId);
    console.log('after deletion', fbuser.friends)
    
     //Flag the model as modified for saving purposes
    fbuser.markModified('friends');
    
    //Save the User Model and Respond to Client
    fbuser.save(function() {
      res.status(200).end();
    });
  })
  
  //DEPRECATED REDIT VERSION
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
  var name = req.body.name;
  var importance; 
  req.body.importance ? importance = req.body.importance : importance = 5;
  console.log('increasing health', name, importance)

  client.hincrby(name, 'health', 10*importance, function(error, result) {
    if (error) {
      res.status(400).send(error)
    } else {
      res.status(200).end();
    }
  })
}

exports.pullFriendsList = function(clientreq, clientres) {
  
  var options = {
    hostname: 'graph.facebook.com',
    method: 'GET',
    path: '/v2.1/me/taggable_friends?access_token=' + clientreq.user.accessToken
  }

  //Start Request
  var req = https.request(options, function(res) {
  });

    //When requestion gets response:
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

// setInterval(globalDecrement, decrementSpeed);
        
