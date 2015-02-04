app.factory('FriendFactory', function($http) {

  var addFriend = function(fbData, twitterData, phone, callback) {
    twitterData.id_str = twitterData.id_str || ' ';
    twitterData.screen_name = twitterData.screen_name || ' ';
    phone = phone || ' ';
        
    var friendData = {
      fbId: fbData.id,
      twitterID: twitterData.id_str,
      twitterName: twitterData.screen_name,
      name: fbData.name,
      phone: phone,
      image: fbData.picture.data.url,
      health: 100
    }

    $http.post('/addFriend', friendData)
    .success(function(data, status, headers, config) {
      callback();
    })
    .error(function(data, status, headers, config) {
      console.log('Error adding friend');
    });
  }

  var deleteFriend = function(fbId, callback) {
    $http.post('/deleteFriend', {fbId: fbId})
    .success(function(data, status, headers, config) {
      callback();
    })
    .error(function(data, status, headers, config) {
      console.log('Error deleting friend');
    })
  }

  var getAllFriends = function(callback) {
    $http.get('/getAllFriends')
    .success(function(data, status, headers, config) {
      callback(data);
    })
    .error(function(data, status, headers, config) {
      console.log('Error pulling friends from database');
    })
  }

  var pullFBFriendsList = function(callback) {
    $http.get('/pullFBFriendsList')
    .success(function(data, status, headers, config) {
      callback(data);
    })
  }
  
  var checkTwitterAccount = function(callback) {
    $http.get('/checkTwitterAccount') 
    .success(function(data, status, headers, config) {
      callback(data)
    })
  }
  
  var pullTwitterFriendsList = function(callback) {
    $http.get('/pullTwitterFriendsList')
    .success(function(data, status, headers, config) {
      callback(data);
    })
  }

  var sendText = function(message, phone, callback) {
    console.log('Sending text:  ' + message + ' to ' + phone);
    $http.post('/sendText', {message: message, phone: phone})
    .success(function(data, status, headers, config) {
      callback();
    }).error(function(data, status, headers, config) {
      alert('error sending text!');
    })
  }

  var tagInFBPost = function(fbID, message, callback) {
    $http.post('/tagInFBPost', {fbID: fbID, message: message})
    .success(function(data, status, headers, config) {
      callback(data)
    })
    .error(function(data, status, headers, config) {
      alert('Error Code: ' + data.errors[0].code + '\nError Message: ' + data.errors[0].message);
    })
  }

  var sendTwitterMessage = function(twitterID, message, callback) {
    $http.post('/sendTwitterMessage', {twitterID: twitterID, message: message})
    .success(function (data, status, headers, config) {
      callback(data)
    })
    .error(function(data, status, headers, config) {
      alert('Error Code: ' + data.errors[0].code + '\nError Message: ' + data.errors[0].message);
    })
  }

  var tagInTweet = function(message, callback) {
    $http.post('/tagInTweet', {message:message})
    .success(function (data, status, headers, config) {
      callback(data)
    })
    .error(function(data, status, headers, config) {
      alert('Error Code: ' + data.errors[0].code + '\nError Message: ' + data.errors[0].message);
    })
  }

  var increaseHealth = function(fbId, amount, callback) {
    $http.post('/increaseHealth', {fbId: fbId, amount: amount})
    .success(function(data, status, headers, config) {
      callback();
    })
  }

  return {
    addFriend: addFriend,
    deleteFriend: deleteFriend,
    getAllFriends: getAllFriends,
    pullFBFriendsList: pullFBFriendsList,
    pullTwitterFriendsList: pullTwitterFriendsList,
    sendText: sendText,
    tagInFBPost: tagInFBPost,
    checkTwitterAccount: checkTwitterAccount,
    sendTwitterMessage: sendTwitterMessage,
    tagInTweet: tagInTweet,
    increaseHealth: increaseHealth
  }
})