var redis = require('redis')
var client = redis.createClient();

var accountSid = "ACb96552b64852d2beafcab1c90c0fdec2";
var authToken = "461c2758cdb74058700561e4ee45776a";
var twilio = require('twilio')(accountSid, authToken);

exports.addFriend = function(req, res) {
  var name = req.body.name;
  var phone = req.body.phone;
  var img = req.body.img;
  var importance = req.body.importance;
  var health = req.body.health;

  client.hmset(name, 'name', name, 'phone', phone, 'img', img, 'importance', importance, 'health', health, function(error, result) {
    if (error) {
      console.log('Error adding friend!');
    } else {
      console.log('Friend succesfully added, here are the details: ' + result);
      res.status(200).end();
    }
  });
};

exports.deleteFriend = function(req, res) {
  var name = req.body.name;

  client.del(name, function(error, result) {
    if (error) {
      console.log('Error deleting friend!');
    } else {
      console.log(result + ' entries were deleted!')
      res.status(200).end();
    }
  })
}

exports.getAllFriends = function(req, res) {
  var allFriends = [];

  client.keys('*', function(error, result) {
    var multi = client.multi();
    var total = result.length;
    var i = 0;

    if (total === 0) {
      res.send(allFriends);
      return;
    }

    result.forEach(function (key) {
        client.hgetall(key, function(error, result) {
          console.log('hgetall result: ', result);
          allFriends.push(result);
          i++;

          if (i === total) {
            res.send(allFriends);
            return;
          }
        })
    })
  });
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
        
