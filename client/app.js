angular.module('friendville', ['ngFx'])

.controller('FarmController', function($scope, $interval, FriendFactory) {



//Menu for Adding Friends
	$scope.menu = {
		name: null,
		phone: null,
		img: null,
		importance: null,
		health: 100
	};

	$scope.friendButton = 'Add Friend';
	$scope.showhide = false;

	$scope.toggle = function() {
		$scope.showhide = !$scope.showhide;
	};

//Friend Profile Information
	$scope.friendarray = [];
	$scope.sms = '';

//Methods
	$scope.getAllFriends = function() {
		FriendFactory.getAllFriends(function(data) {
			$scope.friendarray = data;
			console.log($scope.friendarray)
		})
	}

	//Fetch all friends from DB and check every 5 seconds for updates to health
	$scope.getAllFriends();
	$interval($scope.getAllFriends, 5000);

	$scope.addFriend = function() {
		console.log($scope.menu)
		FriendFactory.addFriend($scope.menu, $scope.getAllFriends);
	}

	$scope.deleteFriend = function(friendname) {
		FriendFactory.deleteFriend(friendname, $scope.getAllFriends);
	}

	$scope.sendText = function(message, phone, name, importance) {
		FriendFactory.sendText(message, phone, FriendFactory.increaseHealth.bind(this, name, importance, $scope.getAllFriends))
	}
})

	
.factory('FriendFactory', function($http) {

	var addFriend = function(friend, callback) {
		console.log('Adding friend named ', friend);
		$http.post('/addFriend', friend)
		.success(function(data, status, headers, config) {
			console.log('Succesfully added friend');
			callback();
		})
		.error(function(data, status, headers, config) {
			console.log('Error adding friend');
		});
	}

	var deleteFriend = function(friendname, callback) {
		$http.post('/deleteFriend', {name: friendname})
		.success(function(data, status, headers, config) {
			console.log('Succesfully deleted ' + friendname);
			callback();
		})
		.error(function(data, status, headers, config) {
			console.log('Error deleting ' + friendname);
		})
	}

	var getAllFriends = function(callback) {
		console.log('Getting all friends')
		$http.get('/getAllFriends')
		.success(function(data, status, headers, config) {
			console.log('Succesfully got all friends')
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

	return {
		addFriend: addFriend,
		deleteFriend: deleteFriend,
		getAllFriends: getAllFriends,
		sendText: sendText,
		increaseHealth: increaseHealth
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



 