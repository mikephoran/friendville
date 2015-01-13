angular.module('friendville', ['ngFx', 'firebase'])

.controller('AddController', function($scope, FriendFactory) {
	
	$scope.menu = {
		name: null,
		phone: null,
		img: null,
		importance: null,
		need: null,
		health: 50
	};

	$scope.friendButton = 'Add Friend';
	$scope.showhide = false;

	$scope.toggle = function() {
		$scope.showhide = !$scope.showhide;
	};

	$scope.addFriend = function() {
		FriendFactory.convertImgToBase64($scope.menu.img, function(base64Img) {
			$scope.menu.img = base64Img;
		});
		FriendFactory.addFriend($scope.menu);
	}

})

.controller('FarmController', function($scope, FriendFactory, $firebase, $interval) {
	
	var ref = new Firebase("https://flickering-inferno-160.firebaseio.com/");
	var sync = $firebase(ref);	
	var friends = sync.$asArray();
	
	$scope.sms = '';

	$scope.deleteFriend = function(i) {
		console.log('deleting friend ', i);
		FriendFactory.deleteFriend(i);
		$scope.$apply();
	}

	$scope.sendText = function(i) {
		console.log('sending text')
		friends[i].health = friends[i].health + 20;
		$scope.$apply();
		friends.$save(i);
	}

	friends.$loaded()
	.then(function() {
		$scope.friendarray = friends;
	})
	.then(function() {
		$interval(function() {
			for (var i=0; i<$scope.friendarray.length; i++) {
				if ($scope.friendarray[i].health > 0) {
					$scope.friendarray[i].health--;
				} else if ($scope.friendarray[i].health === 0) {
					$scope.friendarray[i].img = 'foreveralone.png'
					friends.$save(i);	
				}
				
			} 
		}, 1000);	
	})
})

	
.factory('FriendFactory', function($firebase) {

	var ref = new Firebase("https://flickering-inferno-160.firebaseio.com/");
	var sync = $firebase(ref);	
	var friends = sync.$asArray();
	

	var addFriend = function(friend) {
		friends.$add(friend);
	}

	var deleteFriend = function(friendindex) {
		friends.$remove(friendindex)
	}

	var convertImgToBase64 = function(url, callback, outputFormat){
		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		var img = new Image;
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
			canvas.height = 100;
			canvas.width = 100;
		  	ctx.drawImage(img,0,0);
		  	var dataURL = canvas.toDataURL(outputFormat || 'image/png');
		  	callback.call(this, dataURL);
	        // Clean up
		  	canvas = null; 
		};
		img.src = url;
	}

	return {
		addFriend: addFriend,
		deleteFriend: deleteFriend,
		convertImgToBase64: convertImgToBase64,
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

// $http.post('http://textbelt.com/text', {msg:'hello word!'}).
//   success(function(data, status, headers, config) {
//     // this callback will be called asynchronously
//     // when the response is available
//   }).
//   error(function(data, status, headers, config) {
//     // called asynchronously if an error occurs
//     // or server returns response with an error status.
//   });

  //+1 805-324-6030
//   var accountSid = 'ACb96552b64852d2beafcab1c90c0fdec2'; 
// var authToken = '[AuthToken]';


 