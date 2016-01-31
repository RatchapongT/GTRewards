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
router.delete('/api/game-summary/:id', function (req, res, next) {
    if (req.user) {
        databaseFunction.deleteGame(req.params.id, function (err, game) {
            if (err) {
                console.log(err);
            } else {
                databaseFunction.getHistoryRecent({}, function (err, historyRecent) {
                    if (err) {
                        console.log(err);
                    }

                    return res.json({
                        message: "Success",
                        messageCode: 1,
                        game: game,
                        historyRecent: historyRecent
                    });
                });

            }
        });
    }
});
router.post('/api/game-summary/', function (req, res, next) {
    if (req.user) {
        databaseFunction.editGame(req.body, function (err, game) {
            if (err) {
                console.log(err);
            } else {
                return res.json({
                    message: "Success",
                    messageCode: 1,
                    game: game
                })
            }
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


router.post('/edit-items', function (req, res, next) {
    if (req.user) {

        if (req.body.file) {
            var inputImage = {
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity
            };

            databaseFunction.editItem(inputImage, function (err, result) {
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
        } else {
            var fstream;
            req.pipe(req.busboy);
            req.busboy.on('error', function (err) {
                console.log(err);
            });
            var name;
            var description;
            var price;
            var quantity;
            var id;
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
                if (fieldname == 'id') {
                    id = val;
                }
            });

            req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                var date = new Date();
                date = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
                var extension = filename.substring(filename.length - 3, filename.length);

                if (mimetype != 'image/png') {
                    return res.json({
                        message: "Invalid format",
                        messageCode: 2
                    });
                } else {
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
                            id: id,
                            image: image,
                            name: name,
                            description: description,
                            price: price,
                            quantity: quantity
                        };
                        databaseFunction.editItem(inputImage, function (err, result) {
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
                        databaseFunction.getGames(10, function (err, game) {
                            if (err) {
                                console.log(err);
                            } else {
                                databaseFunction.getHistoryRecent({}, function (err, historyRecent) {
                                    if (err) {
                                        console.log(err);
                                    }

                                    return
                                    res.json({
                                        message: "Complete",
                                        messageCode: 1,
                                        game: game,
                                        historyRecent: historyRecent
                                    });
                                });

                            }
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

router.get('/api/history-recent', function (req, res, next) {
    if (req.user) {
        databaseFunction.getHistoryRecent({}, function (err, historyRecent) {
            if (err) {
                console.log(err);
            }

            return res.json({
                historyRecent: historyRecent
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
router.post('/api/register-new', function (req, res, next) {
    if (req.user) {
        databaseFunction.getRegistrationRecent({}, function (err, regRecent) {
            if (err) {
                console.log(err);
            }

            if (!req.body.gtid || !req.body.firstName || !req.body.lastName || !req.body.email) {
                return res.json({
                    message: 'Invalid Field',
                    messageCode: 2,
                    regRecent: regRecent
                })
            }
            if (req.body.gtid.length != 9) {
                return res.json({
                    message: 'gtID must be 9 digits',
                    messageCode: 2,
                    regRecent: regRecent
                })
            }
            databaseFunction.registerUser(req.body, function (err) {
                if (err) {
                    return res.json({
                        message: err.message,
                        messageCode: 2,
                        regRecent: regRecent
                    })

                }


                return res.json({
                    regRecent: regRecent,
                    message: 'Success',
                    messageCode: 1
                });
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

router.get('/api/registrations-recent', function (req, res, next) {
    if (req.user) {
        databaseFunction.getRegistrationRecent({}, function (err, regRecent) {
            if (err) {
                console.log(err);
            }

            return res.json({
                regRecent: regRecent
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

router.post('/api/manual-points/', function (req, res, next) {
        if (req.user) {
            var input = {};
            if (req.body.type == 'Game') {
                if (req.body.reason) {
                    input = {
                        gtID: req.body.gtid,
                        points: req.body.reason.points,
                        description: req.body.reason.name
                    };
                } else {
                    return res.json({
                        manualMessage: "Invalid Type",
                        manualMessageCode: 2
                    });
                }
            } else if (req.body.type == 'Others') {

                if (req.body.points && req.body.reason) {
                    input = {
                        gtID: req.body.gtid,
                        points: req.body.points,
                        description: req.body.reason
                    };
                } else {
                    return res.json({
                        manualMessage: "Invalid Type",
                        manualMessageCode: 2
                    });
                }
            } else {
                return res.json({
                    manualMessage: "Invalid Type",
                    manualMessageCode: 2
                });
            }
            databaseFunction.saveManualPoints(input, function (err1) {
                databaseFunction.getHistoryRecent({}, function (err2, historyRecent) {

                    if (err1) {
                        return res.json({
                            messageManual: err1.message,
                            messageManualCode: 2,
                            historyRecent: historyRecent
                        });
                    }
                    if (err2) {
                        console.log(err);
                    }
                    return res.json({
                        messageManual: "Success",
                        messageManualCode: 1,
                        historyRecent: historyRecent
                    });
                });
            });
        } else {
            return res.render('error', {
                message: 'No Permission',
                user: null,
                error: null
            });
        }


    }
);

router.get('/query-data', function (req, res, next) {
    var vm = {
        title: 'Query Data',
        user: req.user

    };

    return res.render('query-data', vm);
});
router.post('/api/query-data', function (req, res, next) {
    databaseFunction.queryData(req.body, function (err, queryData) {
        if (err) {
            console.log(err);
        }
        console.log(queryData)
        return res.json({
                queryData: queryData
            }
        )
    });


});
//

module.exports = router;
