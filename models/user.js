var mongoose = require('mongoose')
    , Schema = mongoose.Schema
	    , ObjectId = Schema.ObjectId;


//schemas start

var user_login = new mongoose.Schema({
    _id: {type: String},
    password: {type: String},
});

var user_info = new mongoose.Schema ({
    _id: {type: String},
    phone: {type: String},
    email: {type: String},
    nickname: {type: String}
});

var user_blog = new mongoose.Schema ({
    _id: {type: String},
    blogs: {type: Array}
});

var user_friend = new mongoose.Schema ({
    _id: {type: String},
    friends_ids: {type: Array}
});

/*
* follow_info = {
*   "_id": {type: String},
*   "type": {type: Int}// 1 one way, 2  two way
* }
* */
var user_following = new mongoose.Schema ({
    _id: {type: String},
    follow_infos: {type: Array}
})

var user_position = new mongoose.Schema ({
    _id: {type: String},
    nickname: {type: String},
    longitude: 0.0,
    latitude:  0.0
});


var user_gallery = new mongoose.Schema ({
    _id: {type: String},
    filenames: {type: Array}
});


var user_notification = new mongoose.Schema ({
	_id: {type: String},
});
//schemas end

module.exports = {
    user_login: mongoose.model('user_login', user_login),
    user_info: mongoose.model('user_info', user_info),
    user_blog: mongoose.model('user_blog', user_blog),
    user_friend: mongoose.model('user_friend', user_friend),
    user_following: mongoose.model('user_following', user_following),
    user_gallery: mongoose.model('user_gallery', user_gallery),
    user_position: mongoose.model('user_position', user_position)
}
