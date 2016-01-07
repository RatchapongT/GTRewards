var express = require('express');
var router = express.Router();
var passport = require('passport');
var config = require('../config');
var PendingItem = require('../models/databaseModels').PendingItem;


router.get('/', function (req, res, next) {
    if (req.user) {
        return res.redirect('/');
    }
    var vm = {
        title: 'Login',
        user: req.user,
        message: ''
    };
    return res.render('admin-login', vm);
});

router.post('/', function (req, res, next) {
        req.session.cookie.maxAge = config.cookieMaxAge;
        return next();
    },
    function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                var vm = {
                    title: 'Login',
                    user: req.user,
                    message: 'No Login Found'
                };
                return res.render('admin-login', vm);
            }


            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/');
            });
        })(req, res, next);
    }
);


module.exports = router;

