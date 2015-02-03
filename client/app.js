angular.module('friendville', ['ngFx', 'angucomplete-alt'])

.controller('FarmController', function($scope, $interval, FriendFactory) {

//Menu for Adding Friends
	$scope.phone;
	$scope.fbFriends = [];
	$scope.twitterFriends = [];
	$scope.showMenu = false;

	FriendFactory.pullFBFriendsList(function(data) {
		console.log('DATA from FB FriendsList: ', data.data)
		$scope.fbFriends = data.data;
	});
	
	FriendFactory.pullTwitterFriendsList(function(data) {
		console.log('Data from Twitter FriendsList: ', data.data)
		$scope.twitterFriends = data.data;
	});
	
	$scope.friendButton = 'Add Friend';

	$scope.toggle = function() {
		console.log('toggling')
		$scope.showMenu = !$scope.showMenu;
	};

//Friend Profile Information
	$scope.image;
	$scope.friends = {};
	$scope.sms = '';
	$scope.fbtag = '';

//Methods
	$scope.getAllFriends = function() {
		FriendFactory.getAllFriends(function(data) {
			$scope.friends= data;
		})
	}

	//Fetch all friends from DB and check every 5 seconds for updates to health
	$scope.getAllFriends();
	$interval($scope.getAllFriends, 5000);

	$scope.addFriend = function(fbData, phone, callback) {
		FriendFactory.addFriend($scope.selectedFriend.originalObject, $scope.phone, $scope.getAllFriends);
		$scope.toggle();
	}

	$scope.deleteFriend = function(friendname) {
		FriendFactory.deleteFriend(friendname, $scope.getAllFriends);
	}

	$scope.sendText = function(message, phone, fbId, amount) {
		FriendFactory.sendText(message, phone, FriendFactory.increaseHealth.bind(this, fbId, amount, $scope.getAllFriends))
	}
	
	$scope.tagInFBPost = function(fbID, message, amount) {
		FriendFactory.tagInFBPost(fbID, message, FriendFactory.increaseHealth.bind(this, fbID, amount, $scope.getAllFriends))
	}
	
	$scope.updateImage = function(fbId) {
		console.log('image', $scope.image)
		FriendFactory.updateImage(fbId, $scope.image, $scope.getAllFriends);
	}
})

	
.factory('FriendFactory', function($http) {

	var addFriend = function(fbData, phone, callback) {
		
		var friendData = {fbId: fbData.id, name: fbData.name, phone: phone, img: fbData.picture.data.url, health: 100}
		
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
		console.log('Getting all friends')
		$http.get('/getAllFriends')
		.success(function(data, status, headers, config) {
			console.log('Succesfully got all friends')
			console.log(data)
			callback(data);
		})
	}

	var sendText = function(message, phone, callback) {
		console.log('Sending text:  ' + message + ' to ' + phone);
		$http.post('/sendText', {message: message, phone: phone})
		.success(function(data, status, headers, config) {
			callback();
		})
	}

	var increaseHealth = function(fbId, amount, callback) {
		$http.post('/increaseHealth', {fbId: fbId, amount: amount})
		.success(function(data, status, headers, config) {
			callback();
		})
	}

	var pullFBFriendsList = function(callback) {
		$http.get('/pullFBFriendsList')
		.success(function(data, status, headers, config) {
			callback(data);
		})
	}
	
	var pullTwitterFriendsList = function(callback) {
		$http.get('pullTwitterFriendsList')
		.success(function(data, status, headers, config) {
			callback(data);
		})
	}
	
	var tagInFBPost = function(fbID, message, callback) {
		$http.post('/tagInFBPost', {fbID: fbID, message: message}).success(function(data, status, headers, config) {
			callback(data)
		})
	}
	
	var updateImage = function(fbId, image, callback) {
		$http.post('/updateImage', {fbId: fbId, image: image})
		.success(function(data, status, headers, config) {
			callback();
		})
	}

	return {
		addFriend: addFriend,
		deleteFriend: deleteFriend,
		getAllFriends: getAllFriends,
		sendText: sendText,
		increaseHealth: increaseHealth,
		pullFBFriendsList: pullFBFriendsList,
		pullTwitterFriendsList: pullTwitterFriendsList,
		tagInFBPost: tagInFBPost,
		updateImage: updateImage
	}

})

.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}])



 