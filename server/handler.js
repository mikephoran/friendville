var utils = require('./utils');


exports.root = function(req, res) {
  utils.sendData(res, "Hello World");
}

exports.db = function(req, res) {
  if (request.method) === 'GET') {
} else if (request.method === 'POST') {

} else if (request.method === 'OPTIONS') {
  utils.sendData(response, null, 200);
}

}

//post requests need to send stuff to the database
//get request for database should pull stuff from database
//heroku database?