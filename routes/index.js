var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/users');
var passport = require('passport');
var config = require('../config');
var _ = require('underscore');
var async = require('async');
var Bing = require('node-bing-api')({accKey: "jgk2Sf3SABeYuCaIENSy+r6mIOnCVRP6qM7etOxMbns"});
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'NavLit',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/login', function (req, res, next) {
    if (req.user) {
        return res.redirect('/match');
    }
    var vm = {
        title: 'Login',
        error: req.flash('error')
    };
    res.render('login', vm);
});

router.get('/logout', function (req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
});

router.post('/login',
    function (req, res, next) {
        req.session.cookie.maxAge = config.cookieMaxAge;
        next();
    },
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/match',
        failureFlash: 'Invalid credentials'
    })
);

router.get('/bingsearch', function (req, res, next) {
    var searchEntry = "NavLit";
    databaseFunction.getSearch(searchEntry, function (err, searchResult) {
        if (err) {
            return res.redirect('/');
        }
        console.log(searchResult.results)
        res.render('search', {
            title: 'Search',
            user: req.session.passport.user ? req.session.passport.user.username : undefined,
            name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
            accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined,
            searchResult: searchResult.results, searchEntry: searchEntry
        });
    });


});

router.post('/bingsearch', function (req, res, next) {
    var searchEntry = req.body.searchentry;
    databaseFunction.getSearch(searchEntry, function (err, searchResult) {
        if (err) {
            return res.redirect('/');
        }
        console.log(searchResult.results)
        res.render('search', {
            title: 'Search',
            user: req.session.passport.user ? req.session.passport.user.username : undefined,
            name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
            accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined,
            searchResult: searchResult.results, searchEntry: searchEntry
        });
    });


});

router.get('/page', function (req, res, next) {

    res.render('page', {
        title: 'Page',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/destinations', function (req, res, next) {
    res.render('destinations', {
        title: 'Destinations',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/blog', function (req, res, next) {
    res.render('blog', {
        title: 'Blog',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
        title: 'Contact',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/myprofile', function (req, res, next) {
    res.render('profiles/profile', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/alice', function (req, res, next) {
    res.render('profiles/alice', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/jason', function (req, res, next) {
    res.render('profiles/jason', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/alison', function (req, res, next) {
    res.render('profiles/alison', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/shady', function (req, res, next) {
    res.render('profiles/shady', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/slim', function (req, res, next) {
    res.render('profiles/slim', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/peter', function (req, res, next) {
    res.render('profiles/peter', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/john', function (req, res, next) {
    res.render('profiles/john', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/jill', function (req, res, next) {
    res.render('profiles/jill', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/jane', function (req, res, next) {
    res.render('profiles/jane', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/tom', function (req, res, next) {
    res.render('profiles/tom', {
        title: 'Profile',
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});

router.get('/registration', function (req, res, next) {
    res.render('registration', {
        title: 'Registration',
        error: req.flash('failureMessage'),
        success: req.flash('successMessage'),
        user: req.session.passport.user ? req.session.passport.user.username : undefined,
        name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
        accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined
    });
});
//Commit Test
router.post('/registration', function (req, res, next) {

    if (validateEmail(req.body.username)) {
        var requestInput = req.body.interest.toLowerCase();
        requestInput = requestInput.replace(/\s+/g, '')
        req.body.interest = requestInput.split(",");
        databaseFunction.addUser(req.body, function (err) {
            if (err) {
                req.flash('failureMessage', err.errors.username.message);
                return res.redirect('/registration');
            }
            req.flash('successMessage', 'Successfully Added! Welcome!');
            return res.redirect('/registration');
        });
    } else {
        req.flash('failureMessage', "Invalid Email Format!");
        return res.redirect('/registration');
    }


});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

module.exports = router;
