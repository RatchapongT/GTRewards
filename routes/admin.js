var express = require('express');
var router = express.Router();
var databaseFunction = require('../services/students');
var Excel = require("exceljs");
var fs = require('fs');

router.delete('/api/upload-items/:id', function (req, res, next) {
    if (req.user) {
        databaseFunction.deleteItem(req.params.id, function (err, result) {
            databaseFunction.getItem({}, function (err, itemObject) {
                if (err) {
                    console.log(err);
                }


                return res.json(itemObject);
            });
        });
    }
});

router.post('/upload-items', function (req, res, next) {
    if (req.user) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('error', function (err) {
            console.log(err);
        });
        var name;
        var description;
        var price;
        var quantity;
        req.busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
            if (fieldname == 'name') {
                name = val;
            }
            if (fieldname == 'description') {
                description = val;
            }
            if (fieldname == 'price') {
                price = val;
            }
            if (fieldname == 'quantity') {
                quantity = val;
            }
        });

        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            var date = new Date();
            date = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
            var extension = filename.substring(filename.length - 3, filename.length);
            if (mimetype != 'image/png') {
                res.json({
                    message: "Invalid format",
                    messageCode: 2
                });
            } else {
                console.log("Uploading: " + filename);
                var now = Date.now();
                fstream = fs.createWriteStream(__dirname + '/output-items/' + now + '.' + extension);
                var imgPath = __dirname + '/output-items/' + now + '.' + extension;
                file.pipe(fstream);
                fstream.on('close', function () {
                    console.log("Upload Finished of " + now + '.' + extension);
                    console.log("Processing File... " + now + '.' + extension);
                    var image = {};
                    image.data = "data:image/png;base64," + new Buffer(fs.readFileSync(imgPath)).toString('base64');
                    image.contentType = mimetype;
                    var inputImage = {
                        image: image,
                        name: name,
                        description: description,
                        price: price,
                        quantity: quantity
                    };

                    databaseFunction.saveItem(inputImage, function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        databaseFunction.getItem({}, function (err, itemObject) {
                            if (err) {
                                console.log(err);
                            }
                            res.json({
                                message: "Complete",
                                messageCode: 1,
                                itemObject: itemObject
                            });
                        });


                    });


                });
            }
        });
    }


});

router.get('/upload-items', function (req, res, next) {
    if (req.user) {
        var vm = {
            title: 'Upload Items',
            user: req.user
        };
        res.render('upload-items', vm);
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }
});

router.get('/item-logs', function (req, res, next) {
    if (req.user) {
        var vm = {
            title: 'Upload Items',
            user: req.user
        };
        databaseFunction.getItemLog({}, function (err, itemLogObject) {
            if (err) {
                console.log(err);
            }

            return res.render('item-logs', {
                itemLogObject: itemLogObject,
                title: 'Item Logs',
                user: req.user
            });
        });
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }


});

router.get('/approve-items', function (req, res, next) {
    if (req.user) {
        return res.render('approve-items', {
            user: req.user
        });
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }


});


router.post('/api/approve-items', function (req, res, next) {
    if (req.user) {
        databaseFunction.approveItems({id: req.body.id}, function (err) {
            return res.json({
                message: 'Success',
            });
        })
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }


});


router.post('/api/unapprove-items', function (req, res, next) {
    if (req.user) {
        databaseFunction.unApproveItems({id: req.body.id}, function (err) {
            return res.json({
                message: 'Success'
            });
        })
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }


});

router.get('/api/approve-items', function (req, res, next) {
    if (req.user) {
        databaseFunction.getPendingItem({}, function (err, pendingItemObject) {
            if (err) {
                console.log(err);
            }

            return res.json({
                pendingItemObject: pendingItemObject
            });
        });
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }


});


router.post('/upload-registration', function (req, res, next) {
    if (req.user) {
        var fstream;
        req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename) {
            var extension = filename.substring(filename.length - 4, filename.length);
            if (filename != 'masterdata.xlsx') {
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
                                    row.values[1] != "gtID" &&
                                    row.values[2] != "Last Name" &&
                                    row.values[3] != "First Name" &&
                                    row.values[4] != "Email Address" &&
                                    row.values[5] != "Total Sum") {
                                    res.json({
                                        message: "Parsing Error",
                                        messageCode: 3
                                    });
                                }
                                if (rowNumber > 1) {
                                    var input = {
                                        gtID: row.values[1],
                                        lastName: row.values[2],
                                        firstName: row.values[3],
                                        email: row.values[4],
                                        sum: row.values[5],
                                        requestedCheckout: new Date()
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
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }
});

router.post('/upload-points', function (req, res, next) {
    if (req.user) {
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
            var extension = filename.substring(filename.length - 4, filename.length);
            if (filename != 'gamedata.xlsx') {
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
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }
});

router.get('/upload-registration', function (req, res, next) {
    if (req.user) {
        var vm = {
            title: 'Upload Registration',
            user: req.user

        };

        res.render('upload-registration', vm);
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }
});
router.get('/upload-points', function (req, res, next) {
    if (req.user) {
        var vm = {
            title: 'Upload Points',
            user: req.user

        };

        return res.render('upload-points', vm);
    } else {
        return res.render('error', {
            message: 'No Permission',
            user: null,
            error: null
        });
    }
});

router.get('/logout', function (req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
