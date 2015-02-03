var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/friendville')

//Set Schema for User Model
//

var FacebookUserSchema = new mongoose.Schema({
    fbId: String,
    email: { type : String , lowercase : true},
    name : String,
    twiliophone: String,
    accessToken: String,
    refreshToken: String,
    twitterID: String,
    twitterName: String,
    twitterToken: String,
    twitterTokenSecret: String,
    twitterPhoto: String,
    friends: { type: mongoose.Schema.Types.Mixed, default:  {} }
});

//Compile Schema into User Model
exports.fbUser = mongoose.model('fbs',FacebookUserSchema);
