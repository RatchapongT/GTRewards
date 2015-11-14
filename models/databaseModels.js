var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
    gtID: String,
    name: String,
    email: String,
    sum: Number,
    created: {type: Date, default: Date.now}
});

var historySchema = new Schema({
    gtID: String,
    description: String,
    email: String,
    sum: Number,
    created: {type: Date, default: Date.now}
});

var userSchema = new Schema({
    username: String,
    password: String,
    created: {type: Date, default: Date.now}
});

userSchema.path('username').validate(function (username, next) {
    User.findOne({username : username}, function (err, user) {
        if (err) {
            return next(false);
        }
        if (!user) {
            return next(true); //Valid
        } else {
            return next(false);
        }
    });
}, 'Username Already Exists');

var userDetailSchema = new Schema({
    interest: [String],
    accountType: String,
    profilePicture: String,
    _userDetail: {type: Schema.Types.ObjectId, ref: 'User'},
    created: {type: Date, default: Date.now}
});

var User = mongoose.model('User', userSchema);
var History = mongoose.model('History', historySchema);
var Student = mongoose.model('Student', studentSchema);
var UserDetail = mongoose.model('UserDetail', userDetailSchema);

module.exports = {
    Student: Student,
    History: History,
    User: User,
    UserDetail: UserDetail
};