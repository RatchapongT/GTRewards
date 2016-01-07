var User = require('../models/databaseModels').User;

exports.findUser = function (input, next) {
    User.findOne({username: input.username, password: input.password}, function (err, user) {
        next(err, user);
    });
};
