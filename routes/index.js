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

router.get('/upload', function (req, res, next) {
    var vm = {
        title: 'Upload'

    };

    res.render('upload_data', vm);
});


router.get('/processing/:name', function (req, res, next) {
    console.log(req.params.name)
    var workbook = new Excel.Workbook();
    workbook.xlsx.readFile('./uploads/' + req.params.name)
        .then(function() {
            var sheet1 = workbook.getWorksheet(1);
            var gtid = sheet1.getColumn("A");
            gtid.eachCell(function(cell, rowNumber) {
                console.log(cell.value);
            });
        });

    console.log("YEAA");
});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}

module.exports = router;
