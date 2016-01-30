var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/students');
var Excel = require("exceljs");
var fs = require('fs');

router.get('/', function (req, res, next) {
    return res.render('index', {
        title: 'GT Rewards',
        user: req.user
    });
});


router.get('/rules', function (req, res, next) {
    var vm = {
        title: 'Rules',
        user: req.user

    };

    return res.render('rules', vm);
});


router.get('/leaderboard', function (req, res, next) {

    databaseFunction.getLeaderboard(10, function (err, leaderArray) {
        if (err) {
            console.log(err);
        } else {
            var vm = {
                title: 'Leaderboard',
                leaderArray: leaderArray,
                user: req.user
            };
            return res.render('leaderboard', vm);
        }
    });

});

router.get('/game-summary', function (req, res, next) {
    databaseFunction.getGames(10, function (err, game) {
        if (err) {
            console.log(err);
        } else {
            var vm = {
                title: 'Game Summary',
                game: game,
                user: req.user
            };
            res.render('game-summary', vm);
        }
    });

});


router.get('/api/upload-items', function (req, res, next) {

    databaseFunction.getItem({}, function (err, itemObject) {
        if (err) {
            console.log(err);
        }

        return res.json(itemObject);
    });

});


router.get('/api/game-summary', function (req, res, next) {
    databaseFunction.getGames(10, function (err, game) {
        if (err) {
            console.log(err);
        } else {
            return res.json({
                game: game
            })
        }
    });

});


router.post('/api/checkout', function (req, res, next) {
    databaseFunction.updateItem(req.body, function (err, messageArray) {
        if (err) {
            return res.json({
                checkOutStatusCode: 2,
                message: err.message,
                messageArray: null
            })
        }
        return res.json({
            checkOutStatusCode: 1,
            message: null,
            messageArray: messageArray
        })
    });
});

router.get('/schedule', function (req, res, next) {
    var vm = {
        title: 'Schedule',
        user: req.user

    };

    res.render('schedule', vm);
});
router.post('/api/history', function (req, res, next) {
    databaseFunction.getPointsHistory(req.body, function (err, history, registered) {
        if (err) {
            console.log(err);
        } else {
            databaseFunction.getPosition(req.body, function (err, position) {
                if (err) {
                    console.log(err);
                } else {

                    res.json({
                        history: history,
                        position: position,
                        registered: registered

                    });
                }
            });
        }
    });
});

router.post('/api/get-points', function (req, res, next) {
    databaseFunction.getStudent(req.body, function (err, student) {
        if (err) {
            console.log(err);
        } else {
            return res.json({
                registered: (student != null),
                points: student ? student.sum : 0

            });
        }
    });
});
router.get('/prize', function (req, res, next) {
    var vm = {
        title: 'Prize Store',
        user: req.user

    };
    res.render('prize', vm);
});


module.exports = router;
