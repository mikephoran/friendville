angular.module('friendville', ['ngFx', 'angucomplete-alt'])

.controller('FarmController', function($scope, $interval, FriendFactory) {

//Menu for Adding Friends
	$scope.phone
	$scope.fbFriends = [];
	$scope.showMenu = false;

	FriendFactory.pullFriendsList(function(data) {
		console.log('DATA from Pull FriendsList: ', data.data)
		$scope.fbFriends = data.data;
	});
	
	$scope.friendButton = 'Add Friend';

	$scope.toggle = function() {
		console.log('toggling')
		$scope.showMenu = !$scope.showMenu;
	};

//Friend Profile Information
	$scope.friends = {};
	$scope.sms = '';

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

	$scope.sendText = function(message, phone, name, importance) {
		FriendFactory.sendText(message, phone, FriendFactory.increaseHealth.bind(this, name, importance, $scope.getAllFriends))
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

	var increaseHealth = function(name, importance, callback) {
		$http.post('/increaseHealth', {name: name, importance: importance})
		.success(function(data, status, headers, config) {
			callback();
		})
	}

	var pullFriendsList = function(callback) {
		$http.get('/pullFriendsList')
		.success(function(data, status, headers, config) {
			callback(data);
		})
	}

	return {
		addFriend: addFriend,
		deleteFriend: deleteFriend,
		getAllFriends: getAllFriends,
		sendText: sendText,
		increaseHealth: increaseHealth,
		pullFriendsList: pullFriendsList
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



 