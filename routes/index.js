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
            return res.json({message: "Invalid format"});
        } else {
            console.log("Uploading: " + filename);
            var now = Date.now();
            fstream = fs.createWriteStream(__dirname + '/output/' + now + '.' + extension);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + now + '.' + extension);
                console.log("Processing File... " + now + '.' + extension);
                var workbook = new Excel.Workbook();
                workbook.xlsx.readFile(__dirname + '/output/' + now + '.' + extension)
                    .then(function () {

                        var sheet1 = workbook.getWorksheet(1);
                        sheet1.eachRow({includeEmpty: false}, function (row, rowNumber) {
                            if (rowNumber == 1 &&
                                row.values[1] != "GTID" &&
                                row.values[2] != "Name" &&
                                row.values[3] != "Email" &&
                                row.values[4] != "Total Sum") {
                                res.json({message: "Error Parsing",
                                            });
                            }
                            console.log("HII")
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
                                            console.log(err);
                                        }
                                    });
                                }

                            }

                        });
                        console.log("done")
                        res.json({message: "Complete"});
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
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

module.exports = router;
