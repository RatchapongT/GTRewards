var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/users');
var Excel = require("exceljs");
var passport = require('passport');
var config = require('../config');
var _ = require('underscore');
var async = require('async');
var Bing = require('node-bing-api')({accKey: "jgk2Sf3SABeYuCaIENSy+r6mIOnCVRP6qM7etOxMbns"});

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
router.post('/upload', function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        var extension = filename.substring(filename.length - 4, filename.length);
        if (extension != 'xlsx' && filename != 'onetime.xlsx') {
            console.log("Not supported: " + extension);
        } else {
            console.log("Uploading: " + filename);
            var now = Date.now();
            fstream = fs.createWriteStream(__dirname + '/output/' + now + filename.substring(filename.length - 4, filename.length));
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + now + filename.substring(filename.length - 4, filename.length));
                console.log("Processing File... " + now + filename.substring(filename.length - 4, filename.length));
                var workbook = new Excel.Workbook();
                workbook.xlsx.readFile(__dirname + '/output/' + now + filename.substring(filename.length - 4, filename.length))
                    .then(function () {

                        var sheet1 = workbook.getWorksheet(1);
                        sheet1.eachRow({includeEmpty: false}, function (row, rowNumber) {
                            var gtid = row.values[1];
                            var name = row.values[2];
                            var email = row.values[3];
                            var sum = row.values[4];
                            console.log(gtid + '/' + name + '/' + email + '/' + sum);
                        });
                        console.log("Finished Processing");
                    });

            });
        }
    });
});

router.get('/upload', function (req, res, next) {
    var vm = {
        title: 'Upload'

    };

    res.render('upload_data', vm);
});


function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

module.exports = router;
