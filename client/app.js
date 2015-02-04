var app = angular.module('friendville', ['ngFx', 'angucomplete-alt']);

app.controller('FarmController', function($scope, $interval, FriendFactory) {

//"Add Friend" Menu Variables
	$scope.friendButton = 'Add Friend';
	$scope.phone;
	$scope.fbFriends = [];
	$scope.twitterFriends = [];
	$scope.showMenu = false;
	$scope.twitterAccount = false;

//Friend Profile Variables
	$scope.friends = {};
	$scope.sms;
	$scope.fbtag;
	$scope.twitterMessage;
	$scope.tweet;

//Methods
	$scope.toggle = function() {
		$scope.showMenu = !$scope.showMenu;
	};

	$scope.addFriend = function(fbData, twitterData, phone, callback) {
		if ($scope.selectedTwitterFriend) {
			FriendFactory.addFriend($scope.selectedFBFriend.originalObject, $scope.selectedTwitterFriend.originalObject, $scope.phone, $scope.getAllFriends);
		} else {
			FriendFactory.addFriend($scope.selectedFBFriend.originalObject, {}, $scope.phone, $scope.getAllFriends);
		}
		$scope.toggle();
	}

	$scope.deleteFriend = function(friendname) {
		FriendFactory.deleteFriend(friendname, $scope.getAllFriends);
	}

	$scope.getAllFriends = function() {
		FriendFactory.getAllFriends(function(data) { $scope.friends= data;})
	}

	$scope.sendText = function(message, phone, fbId, amount) {
		FriendFactory.sendText(message, phone, FriendFactory.increaseHealth.bind(this, fbId, amount, $scope.getAllFriends))
	}

	$scope.tagInFBPost = function(fbID, message, amount) {
		FriendFactory.tagInFBPost(fbID, message, FriendFactory.increaseHealth.bind(this, fbID, amount, $scope.getAllFriends))
	}

	$scope.sendTwitterMessage = function(twitterID, fbID, message, amount) {
		FriendFactory.sendTwitterMessage(twitterID, message, FriendFactory.increaseHealth.bind(this, fbID, amount, $scope.getAllFriends))
	}

	$scope.tagInTweet = function(twitterName, fbID, tweet, amount) {
		var builtMessage = '@' + twitterName + ' - ' + tweet;
		FriendFactory.tagInTweet(builtMessage, FriendFactory.increaseHealth.bind(this, fbID, amount, $scope.getAllFriends))
	}

//INITIALIZE DATA

//Populate friends from database
	$scope.getAllFriends();

//Pull Facebook Friend Data
	FriendFactory.pullFBFriendsList(function(data) {
		$scope.fbFriends = data.data;
	});

//Determine if User has logged into Twitter and, if so, pull Twitter Friend Data
	FriendFactory.checkTwitterAccount(function(data) {
		if (data === "true") {
			$scope.twitterAccount = true;
			FriendFactory.pullTwitterFriendsList(function(data) {
				$scope.twitterFriends = data.users;
			})
		} else {
			$scope.twitterAccount = false;
		}
	})
})
