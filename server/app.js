var http = require('http');
var urlParser = require('url');
var utils = require('./utils');
var handler = require('./handler');

var ip = "127.0.0.1";
var port = 3000;

//Setup server and send requests to Router if they are valid routes
var server = http.createServer(function(req, res) {
  var path = urlParser.parse(request.url).pathname;
  router[path] ? router[path](request,response) : util.sendData(response, null, 404);
})

//Router sends requests to appropriate handler function
var router = {
  '/' : handler.root,
  '/' : 
}


//Set server to listen
server.listen(port,ip);
console.log("server running at" + ip + ":" + port);



