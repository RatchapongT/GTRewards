var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/users');
var _ = require("underscore");

/* GET match page. */
router.get('/', function (req, res, next) {
    if (req.session.passport.user) {
        databaseFunction.findMatch(req.session.passport.user, function (err, matchedObject) {

            var myInterest = req.session.passport.user.interest;
            var matchedPeople = []
            var matchedInterest = []
            var matchedName = []
            var matchedNameCap = []
            matchedObject.forEach(function (entry) {
                var intersect = _.intersection(entry.interest, myInterest);
                if (intersect.length > 0) {
                    var name = entry._userDetail.username.split("@");
                    matchedPeople.push(entry);
                    matchedName.push(name[0])
                    matchedNameCap.push(capitalize(name[0]))
                    matchedInterest.push(intersect);
                }

            });
            if (err) {
                return res.send(err);
            }
            return res.render('match', {
                title: 'Match',
                user: req.session.passport.user ? req.session.passport.user.username : undefined,
                name: req.session.passport.user ? capitalize(req.session.passport.user.name) : undefined,
                myInterest: req.session.passport.user ? req.session.passport.user.interest : undefined,
                accountType: req.session.passport.user ? capitalize(req.session.passport.user.accountType) : undefined,
                matchedPeople: matchedPeople,
                matchedInterest: matchedInterest,
                matchedName: matchedName,
                matchedNameCap: matchedNameCap
            });
        });
    }

});

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

module.exports = router;
