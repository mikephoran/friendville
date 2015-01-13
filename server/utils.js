var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type' : "application/json"
};

exports.sendData = function(response, data, statusCode) {
  var statusCode = statusCode || 200;
  var headers = defaultCorsHeaders;
  response.writeHead(statusCode, headers);
  response.end(data);
}

exports.receiveData = function(request, callback) {
  var msgstring = "";
  request.on('data', function(chunk) {msgstring+=chunk;});
  request.on('end', function() {callback(JSON.parse(msgstring));});
};

