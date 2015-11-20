var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/students');
var Excel = require("exceljs");
var passport = require('passport');
var config = require('../config');
var _ = require('underscore');
var async = require('async');

var path = require('path')
var busboy = require('connect-busboy'); //middleware for form/file upload
var fs = require('fs');

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

router.post('/upload-registration', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);

    req.busboy.on('file', function (fieldname, file, filename) {
        var extension = filename.substring(filename.length - 4, filename.length);
        if (filename != 'register.xlsx') {
            res.json({
                message: "Invalid format",
                messageCode: 2
            });
        } else {
            console.log("Uploading: " + filename);
            var now = Date.now();
            fstream = fs.createWriteStream(__dirname + '/output-registration/' + now + '.' + extension);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + now + '.' + extension);
                console.log("Processing File... " + now + '.' + extension);
                var workbook = new Excel.Workbook();
                workbook.xlsx.readFile(__dirname + '/output-registration/' + now + '.' + extension)
                    .then(function () {

                        var sheet1 = workbook.getWorksheet(1);
                        sheet1.eachRow({includeEmpty: false}, function (row, rowNumber) {
                            if (rowNumber == 1 &&
                                row.values[1] != "GTID" &&
                                row.values[2] != "Name" &&
                                row.values[3] != "Email" &&
                                row.values[4] != "Total Sum") {
                                res.json({
                                    message: "Parsing Error",
                                    messageCode: 3
                                });
                            }
                            if (rowNumber > 1) {
                                var input = {
                                    gtID: row.values[1],
                                    name: row.values[2],
                                    email: row.values[3],
                                    sum: row.values[4]
                                }

                                if (row.values[1] != undefined) {
                                    databaseFunction.addStudent(input, function (err, object) {
                                        if (err) {
                                            console.log(input);
                                            console.log(err);
                                        }
                                    });
                                }

                            }

                        });
                        res.json({
                            message: "Complete",
                            messageCode: 1
                        });
                    });

            });
        }
    });
});

router.post('/upload-points', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('error', function (err) {
        console.log(err);
    });
    var points = 0;
    req.busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
        points = val;
    });

    req.busboy.on('file', function (fieldname, file, filename) {
        var date = new Date();
        date = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
        var extension = filename.substring(filename.length - 4, filename.length);
        if (filename != 'points.xlsx') {
            res.json({
                message: "Invalid format",
                messageCode: 2
            });
        } else {
            console.log("Uploading: " + filename);
            var now = Date.now();
            fstream = fs.createWriteStream(__dirname + '/output-points/' + now + '.' + extension);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + now + '.' + extension);
                console.log("Processing File... " + now + '.' + extension);
                var workbook = new Excel.Workbook();
                workbook.xlsx.readFile(__dirname + '/output-points/' + now + '.' + extension).then(function () {
                    workbook.eachSheet(function (worksheet, sheetId) {
                        worksheet.eachRow({includeEmpty: false}, function (row, rowNumber) {
                            if (rowNumber == 1 &&
                                row.values[1] != "Cust Num" &&
                                row.values[2] != "Customer Name" &&
                                row.values[3] != "Opponent") {
                                res.json({
                                    message: "Parsing Error",
                                    messageCode: 3
                                });
                            }
                            if (rowNumber > 1) {
                                var input = {
                                    gtID: row.values[1],
                                    name: row.values[2],
                                    opponent: row.values[3],
                                    points: parseInt(points),
                                    date: date
                                }

                                if (row.values[1] != undefined) {
                                    databaseFunction.updateStudent(input, function (err, object) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }

                            }

                        });
                    });
                    res.json({
                        message: "Complete",
                        messageCode: 1
                    });
                });

            });
        }
    });

});

router.get('/upload-registration', function (req, res, next) {
    var vm = {
        title: 'Upload Registration'

    };

    res.render('upload-registration', vm);
});
router.get('/upload-points', function (req, res, next) {
    var vm = {
        title: 'Upload Points'

    };

    res.render('upload-points', vm);
});
router.get('/schedule', function (req, res, next) {
    var vm = {
        title: 'Schedule'

    };

    res.render('schedule', vm);
});
router.post('/api/history', function (req, res, next) {
    databaseFunction.getPointsHistory(req.body, function (err, history) {
        if (err) {
            console.log(err);
        } else {
            res.json(history);
        }
    });
});
router.get('/prize', function (req, res, next) {
    var vm = {
        title: 'Prize Store'

    };

    res.render('prize', vm);
});
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

module.exports = router;
