var PendingItem = require('../models/databaseModels').PendingItem;

module.exports = function () {
    var passport = require('passport');
    var passportLocal = require('passport-local');
    var databaseFunction = require('../services/users')

    passport.use(new passportLocal.Strategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, next) {

        databaseFunction.findUser({username: username, password: password}, function (err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                PendingItem.find({approved: false}, function (err, pendingItem) {
                    var serializeObject = {
                        username: user.username,
                        approveCount: pendingItem.length
                    }
                    next(null, serializeObject);
                })


            } else {
                next(null, null);
            }


        });

    }));

    passport.serializeUser(function (serializeObject, next) {
        next(null, serializeObject);
    });

    passport.deserializeUser(function (userObject, next) {
        databaseFunction.findUser(userObject.username, function (err, user) {
            next(err, userObject);
        });
    });
};