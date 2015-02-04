var fbUser = require('./db').fbUser

var globalDecrement = function() {
  fbUser.find({}, 'friends', null, function(err, docs) {
    docs.forEach(function(doc) {
      if (Object.keys(doc.friends).length > 0) {
        for (var key in doc.friends) {
          if (doc.friends[key].health > 0) {
            doc.friends[key].health--;
            doc.markModified('friends');
            doc.save();
          }
        }
      }
    })
  })
}

var decrementSpeed = 1000 *  1200;  //Loses 1 health every 20 minutes
setInterval(globalDecrement, decrementSpeed);



//DEPRECATED REDIS VERSION
//----------------------------
// var globalDecrement = function() {  
  // client.keys('*', function(error, result) {
  //   var multi = client.multi();
  //   var total = result.length;
  //   var i = 0;

  //   if (total === 0) {
  //     return;
  //   }

  //   result.forEach(function (key) {

  //     var currentkey = key;

  //     client.hget(currentkey, 'health', function(error, result) {
        
  //       if (result > 0) {
         
  //         client.hincrby(key, 'health', -1, function(error, result) {
  //           i++;
  //           if (i === total) {
  //             console.log('Global Decrement Complete')
  //             return;
  //           } 
  //         })
  //       } else {
  //         i++;
  //         if (i === total) {
  //           console.log('Global Decrement Complete')
  //           return;
  //         } 
  //       }
  //     })
  //   })
  // })
 // }