var request = require("request");

process.on('message', function(options){
    
    request.get(options, function(err, res, body) {
        var data = {
            err: err,
            content: body
        }
        try {
            process.send(data);
        }
        catch(err){
            console.log("friendpuller.js: problem with process.send() " + err.message + ", " + err.stack);
        }
    })
});

process.on('uncaughtException',function(err){
    console.log("friendpuller.js: " + err.message + "\n" + err.stack);
})












//DEPRECATED HTTPS MODULE VERISON 

// process.on('message', function(msg){
    
//     //Pull FB Friends and Send Back
//     
//     var options = {
//         hostname: 'graph.facebook.com',
//         method: 'GET',
//         path: '/v2.2/me/taggable_friends?access_token=' + msg.accessToken
//     }
    
//     //Start Request
//     var req = https.request(options, function(res) {});
//     //On response, use response object to collect data:
//     req.on('response', function (response) {
//         var data = "";
//         //Data response means add to data variable
//         response.on('data', function (chunk) {
//             data += chunk;
//         });
//         //End response means data collected, send back to Parent Process
//         response.on('end', function(){
//             try{
//                 process.send(data);
//             }
//             catch(err){
//                 console.log("friendpuller.js: problem with process.send() " + err.message + ", " + err.stack);
//             }
//         })
//     });
    
//     //On error, console the error
//     req.on('error', function(e) {
//         console.error(e);
//     });
    
//     //No more listeners, end request
//     req.end();
// });