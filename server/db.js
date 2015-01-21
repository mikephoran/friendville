var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test')

//Set Schema for User Model
var FacebookUserSchema = new mongoose.Schema({
    fbId: String,
    email: { type : String , lowercase : true},
    name : String,
    twiliophone: String
});

//Compile Schema into User Model
exports.FbUsers = mongoose.model('fbs',FacebookUserSchema);

