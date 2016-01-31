var Student = require('../models/databaseModels').Student;
var History = require('../models/databaseModels').History;
var Game = require('../models/databaseModels').Game;
var Item = require('../models/databaseModels').Item;
var ItemLog = require('../models/databaseModels').ItemLog;
var PendingItem = require('../models/databaseModels').PendingItem;
var async = require('async');
var _ = require('underscore');

exports.addStudent = function (input, next) {
    //var option = {
    //    gtID: input.gtID,
    //    name: input.name,
    //    email: input.email,
    //    sum: input.sum
    //}
    Student.findOne({gtID: input.gtID}, function (err, student) {
        if (err) {
            return next(err);
        }
        if (student == null) {

            var newStudent = new Student(input);
            newStudent.save(function (err) {
                if (err) {
                    return next(err);
                }
            });
        }
        return next(err, student);

    });
    //Student.update({gtID: input.gtID}, option, {upsert: true}, function (err, object) {
    //    if (err) {
    //        return next(err);
    //    }
    //    else {
    //        next(object);
    //    }
    //});

};

exports.updateStudent = function (input, next) {
    async.waterfall([
        function (callback) {
            Student.findOne({gtID: input.gtID}, function (err, student) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, student);
                }

            });
        },
        function (student, callback) {
            if (student != null) {
                var option = {
                    _studentDetail: student._id,
                    description: input.opponent,
                    points: input.points,
                    date: input.date
                }
                History.findOneAndUpdate(option, option, {upsert: true}, function (err, history) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        callback(null, student, history);
                    }

                });
            } else {
                callback(null, student, null);
            }


        },
        function (student, history, callback) {
            if (student != null) {
                var option = {
                    name: input.opponent,
                    points: input.points,
                    date: input.date
                }
                Game.findOneAndUpdate(option, option, {upsert: true}, function (err, game) {
                    if (err) {
                        callback(err, null, null);
                    } else {
                        callback(null, student, history);
                    }

                });
            } else {
                callback(null, student, null);
            }
        }
        ,
        function (student, history, callback) {
            if (student != null && history == null) {
                var query = {gtID: input.gtID};

                var update = {sum: input.points + student.sum};
                Student.findOneAndUpdate(query, update, {upsert: false}, function (err, results) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, results);
                    }


                });
            } else {
                callback(null, 'No Updates');
            }

        }

    ], function (err, result) {
        next(err, result);
    });

};

exports.deleteUser = function (input, res, next) {
    User.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};

exports.getPointsHistory = function (input, next) {
    Student.findOne({gtID: input.gtID}, function (err, student) {
        if (err) {
            next(err, null)
        } else {
            if (student != null) {
                History.find({_studentDetail: student.id}, function (err, history) {
                    if (err) {
                        next(err, null, true)
                    } else {
                        next(err, history, true)
                    }

                });
            } else {
                next(err, null, false);
            }

        }

    });
};

exports.getStudent = function (input, next) {
    Student.findOne({gtID: input.gtID}, function (err, student) {
        if (err) {
            next(err, null)
        } else {
            next(err, student, true)

        }

    });
};
exports.saveItem = function (input, next) {
    var option = {
        image: input.image,
        name: input.name,
        description: input.description,
        price: input.price,
        quantity: input.quantity
    };
    Item.findOneAndUpdate({name: input.name}, option, {upsert: true}, function (err, item) {
        if (err) {
            next(err, null);
        } else {
            next(null, item);
        }
    });
}

exports.editItem = function (input, next) {
    var option = {};
    if (input.image) {

        option = {
            $set: {
                image: input.image,
                id: input.id,
                name: input.name,
                description: input.description,
                price: input.price,
                quantity: input.quantity
            }
        };
    } else {
        option = {
            $set: {
                id: input.id,
                name: input.name,
                description: input.description,
                price: input.price,
                quantity: input.quantity
            }
        };

    }
    Item.update({_id: input.id}, option, function (err, item) {
        if (err) {
            next(err, null);
        } else {
            next(null, item);
        }
    });
}

exports.getItem = function (input, next) {

    Item.find({}, function (err, item) {
        if (err) {
            next(err, null);
        } else {
            next(null, item);
        }
    });
}

exports.deleteItem = function (input, next) {
    Item.remove({
        _id: input
    }, function (err, item) {
        if (err) {
            next(err, null);
        } else {
            next(null, item);
        }
    });
}

exports.deleteGame = function (input, next) {
    Game.findOne({_id: input}, function (err, gameObject) {
        if (err) {
            next(err, null);
        }
        History.find({
            description: gameObject.name,
            points: gameObject.points,
            date: gameObject.date
        }, function (err, historyObjects) {
            async.each(historyObjects, function (history, callback) {
                Student.update({_id: history._studentDetail}, {$inc: {sum: -1 * history.points}}, function (err) {
                    if (err) {
                        callback(err);
                    }
                    history.remove(function (err) {
                        if (err) {
                            callback(err);
                        }
                        callback();
                    })

                });
            }, function (err) {
                if (err) {
                    console.log('An entry failed to process');
                } else {
                    gameObject.remove(function (err) {
                        if (err) {
                            console.log('Fail to remove');
                        }
                        Game.find({}, function (err, game) {
                            if (err) {
                                next(err, null);
                            } else {
                                next(err, game);
                            }
                        });
                    })

                }
            });
        });
    });

}
exports.editGame = function (input, next) {
    Game.findOneAndUpdate({_id: input.id}, {$set: {name: input.name}}, function (err, gameObject) {
        if (err) {
            next(err, null);
        }
        History.update({
            description: gameObject.name,
            points: gameObject.points,
            date: gameObject.date
        }, {$set: {description: input.name}}, {multi: true}, function (err) {
            if (err) {
                next(err, null);
            }
            Game.find({}, function (err, game) {
                if (err) {
                    next(err, null);
                } else {
                    next(err, game);
                }
            });
        });
    });

}
exports.getGames = function (input, next) {
    Game.find({}, function (err, game) {
        if (err) {
            next(err, null);
        } else {
            next(err, game);
        }
    });
};

exports.getPosition = function (input, next) {


    Student.find({}).sort({sum: -1}).exec(function (err, students) {
        if (err) {
            next(err, null)
        } else {
            if (students) {

                var pre = students[0].sum;
                var position = 1;
                for (var i = 0; i < students.length; i++) {

                    if (pre != students[i].sum) {
                        pre = students[i].sum;
                        position = i + 1;
                    }
                    if (students[i].gtID == input.gtID) {
                        break;
                    }
                }

                next(err, position);

            } else {
                next(err, null);
            }

        }

    });
};

exports.getLeaderboard = function (input, next) {


    Student.find({}).sort({sum: -1}).exec(function (err, students) {
        if (err) {
            next(err, null)
        } else {
            if (students) {

                var leaderArray = [];
                var pre = students[0].sum;
                var position = 1;
                for (var i = 0; i < students.length; i++) {

                    if (pre != students[i].sum) {
                        if (i > input) {
                            break;
                        }
                        pre = students[i].sum;
                        position = i + 1;
                    }
                    leaderArray.push({
                        position: position,
                        firstName: students[i].firstName,
                        lastName: students[i].lastName,
                        points: students[i].sum
                    })

                }
                next(err, leaderArray);


            } else {
                next(err, []);
            }

        }

    });
};

exports.updateItem = function (input, next) {
    if (!validVariable(input) || !validVariable(input.quantity) || !validVariable(input.gtID)) {
        return next({message: 'Invalid Input'});
    } else {
        var ordered = [];
        for (var key in input.quantity) {
            if (input.quantity[key] > 0) {
                ordered.push({
                    itemID: key,
                    quantity: input.quantity[key]
                })

            }

        }

    }// assuming openFiles is an array of file names

    var realOrder = [];

    Student.findOneAndUpdate({gtID: input.gtID}, {$set: {requestedCheckout: new Date()}}, function (err, studentObject) {
        var currentClick = new Date();
        if (currentClick.getTime() - studentObject.requestedCheckout.getTime() > 60000) {
            if (studentObject) {
                async.each(ordered, function (file, callback) {
                    console.log('Processing Order ' + file.itemID);
                    Item.findOne({_id: file.itemID}, function (err, itemObject) {
                        if (err) {
                            return callback(err);
                        } else {
                            realOrder.push({
                                itemObject: itemObject,
                                quantity: file.quantity
                            });
                            callback();
                        }
                    });
                }, function (err) {
                    if (err) {
                        console.log('A file failed to process');
                    } else {
                        var failedQuantity = false;
                        var failedPrice = false;
                        var totalPrice = 0;
                        for (var i = 0; i < realOrder.length; i++) {
                            totalPrice = totalPrice + realOrder[i].itemObject.price * realOrder[i].quantity;
                            if (realOrder[i].quantity > realOrder[i].itemObject.quantity) {
                                failedQuantity = true;
                            }
                        }
                        if (totalPrice > studentObject.sum) {
                            failedPrice = true;
                        }

                        if (failedPrice) {
                            return next({message: 'Not Enough Points'});
                        }
                        if (failedQuantity) {
                            return next({message: 'Not Enough Quantity (Try Refreshing)'});
                        }
                        var messageArray = [];

                        async.each(realOrder, function (processOrder, callback) {
                            console.log('Processing Real Order ' + processOrder.itemObject.name);
                            Item.update({
                                _id: processOrder.itemObject._id,
                                quantity: {$gte: processOrder.quantity}
                            }, {$inc: {quantity: -processOrder.quantity}}, function (err, result) {
                                if (result.n == 0) {
                                    messageArray.push('Not enough ' + processOrder.itemObject.name + ' for ' + processOrder.quantity + ' orders');
                                } else {
                                    messageArray.push('Processed ' + processOrder.itemObject.name + ' for ' + processOrder.quantity + ' orders');
                                    var requestedTimeStamp = new Date();
                                    var newItemLog = new ItemLog({
                                        gtID: studentObject.gtID,
                                        lastName: studentObject.lastName,
                                        firstName: studentObject.firstName,
                                        email: studentObject.email,
                                        sum: studentObject.sum,
                                        description: '[Pending] Requested ' + processOrder.itemObject.name,
                                        price: processOrder.itemObject.price,
                                        quantityRequested: processOrder.quantity,
                                        created: requestedTimeStamp
                                    });
                                    newItemLog.save(function (err) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        var newHistorySchema = new History({
                                                _studentDetail: studentObject._id,
                                                description: '[Pending] Requested ' + processOrder.itemObject.name + '[' + processOrder.quantity + '] at ' + processOrder.itemObject.price + ' points each.',
                                                points: -1 * processOrder.quantity * processOrder.itemObject.price,
                                                date: requestedTimeStamp
                                            }
                                        );
                                        newHistorySchema.save(function (err) {
                                            if (err) {
                                                return callback(err);
                                            }
                                            var newPendingItemsSchema = new PendingItem({
                                                    _itemDetail: processOrder.itemObject._id,
                                                    _studentDetail: studentObject._id,
                                                    _historyDetail: newHistorySchema._id,
                                                    requestStamp: requestedTimeStamp,
                                                    price: processOrder.itemObject.price,
                                                    quantity: processOrder.quantity,
                                                    approvedStamp: null,
                                                    approved: false
                                                }
                                            );
                                            newPendingItemsSchema.save(function (err) {
                                                if (err) {
                                                    return callback(err);
                                                }
                                                Student.update({gtID: input.gtID}, {$inc: {sum: -1 * processOrder.quantity * processOrder.itemObject.price}}, function (err) {
                                                    if (err) {
                                                        return callback(err);
                                                    }
                                                    return callback();
                                                });
                                            });
                                        });
                                    });
                                }
                            })
                        }, function (err) {
                            if (err) {
                                return next(err);
                            } else {
                                return next(null, messageArray);
                            }
                        });
                    }
                });
            } else {
                return next({message: 'gtID Not Found'});
            }
        } else {
            return next({message: 'Please try checkout again in 1 minute'})
        }
    })


}

exports.unApproveItems = function (input, next) {
    var approvedTimeStamp = new Date();
    PendingItem.findOneAndUpdate({_id: input.id}, {
        $set: {
            approved: true,
            approvedStamp: approvedTimeStamp
        }
    }, function (err, pendingObject) {
        Item.findOne({_id: pendingObject._itemDetail}, function (err, itemObject) {
            var string = '[Cancelled] ' + itemObject.name + '[' + pendingObject.quantity + '] at ' + pendingObject.price + ' points each.'
            History.update({_id: pendingObject._historyDetail}, {$set: {description: string}}, function (err) {
                Student.findOneAndUpdate({_id: pendingObject._studentDetail}, {$inc: {sum: pendingObject.quantity * itemObject.price}}, function (err, studentObject) {
                    var newItemLog = new ItemLog({
                        gtID: studentObject.gtID,
                        lastName: studentObject.lastName,
                        firstName: studentObject.firstName,
                        email: studentObject.email,
                        sum: studentObject.sum,
                        description: '[Cancelled] ' + itemObject.name,
                        price: itemObject.price,
                        quantityRequested: pendingObject.quantity,
                        created: approvedTimeStamp
                    });
                    newItemLog.save(function (err) {
                        if (err) {
                            return next(err)
                        }
                        var newHistorySchema = new History({
                                _studentDetail: studentObject._id,
                                description: '[Refunded] ' + itemObject.name + '[' + pendingObject.quantity + '] at ' + itemObject.price + ' points each.',
                                points: pendingObject.quantity * itemObject.price,
                                date: approvedTimeStamp
                            }
                        );
                        newHistorySchema.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            return next(err);
                        });
                    });
                })

            });
        })
    })
}


exports.approveItems = function (input, next) {
    var approvedTimeStamp = new Date();
    PendingItem.findOneAndUpdate({_id: input.id}, {
        $set: {
            approved: true,
            approvedStamp: approvedTimeStamp
        }
    }, function (err, pendingObject) {
        Item.findOne({_id: pendingObject._itemDetail}, function (err, itemObject) {
            var string = '[Approved] Redeemed ' + itemObject.name + '[' + pendingObject.quantity + '] at ' + pendingObject.price + ' points each.'
            History.update({_id: pendingObject._historyDetail}, {$set: {description: string}}, function (err) {
                Student.findOne({_id: pendingObject._studentDetail}, function (err, studentObject) {
                    var newItemLog = new ItemLog({
                        gtID: studentObject.gtID,
                        lastName: studentObject.lastName,
                        firstName: studentObject.firstName,
                        email: studentObject.email,
                        sum: studentObject.sum,
                        description: '[Approved] Redeemed ' + itemObject.name,
                        price: itemObject.price,
                        quantityRequested: pendingObject.quantity,
                        created: approvedTimeStamp
                    });
                    newItemLog.save(function (err) {
                        if (err) {
                            return next(err)
                        }
                        return next(err);
                    });
                });
            })

        });
    })
}
exports.getItemLog = function (input, next) {
    ItemLog.find({}, function (err, itemLogObject) {
        if (err) {
            return next(err, null);
        }
        return next(null, itemLogObject);
    })
}

exports.getPendingItem = function (input, next) {
    PendingItem.find({approved: false}).deepPopulate(['_itemDetail', '_studentDetail']).exec(function (err, pendingObject) {
        if (err) {
            return next(err, null);
        }
        return next(null, pendingObject);
    })
}
exports.saveManualPoints = function (input, next) {
    console.log(input);
    Student.findOne({gtID: input.gtID}, function (err, studentObject) {
        if (studentObject) {
            Student.update({gtID: input.gtID}, {$inc: {sum: input.points}}, function (err) {
                if (err) {
                    return next(err);
                }
                var newHistory = new History({
                    _studentDetail: studentObject._id,
                    description: input.description,
                    points: input.points,
                    date: new Date()
                });
                newHistory.save(function (err) {
                    return next(err);
                })
            })

        } else {
            return next({message: "not found"});
        }
    });
}
exports.getHistoryRecent = function (input, next) {
    History.find({}).sort({created: -1}).limit(10).deepPopulate(['_studentDetail']).exec(function (err, historyObject) {
        if (err) {
            return next(err, null);
        }
        return next(null, historyObject);
    });
}
exports.getRegistrationRecent = function (input, next) {
    Student.find({}).sort({created: -1}).limit(10).exec(function (err, studentObjects) {
        if (err) {
            return next(err, null);
        }
        return next(null, studentObjects);
    });
}
exports.registerUser = function (input, next) {

    Student.findOne({gtID: input.gtid}, function (err, student) {
        if (student) {
            return next({message: "gtID Already Exist"});
        } else {
            var newUser = new Student({
                gtID: input.gtid,
                lastName: input.lastName,
                firstName: input.firstName,
                email: input.email,
                sum: 0,
                requestedCheckout: new Date()
            })
            newUser.save(function (err) {
                return next(err);
            })
        }
    })
}

exports.queryData = function (input, next) {
    if(!input.min) {
        input.min = -9999;
    }
    if(!input.max) {
        input.max = 9999;
    }
    //Student.find(, function (err, student) {
    //    //console.log(student)
    //    if (err) {
    //        return next(err, null);
    //    } else {
    //
    //       return next(null, student);
    //    }
    //})

    Student.find({
        sum: {
            $gte: input.min,
            $lte: input.max
        }
    }).sort({sum: -1}).exec(function (err, studentObjects) {
        if (err) {
            return next(err, null);
        }
        return next(null, studentObjects);
    });
}

function validVariable(input) {
    return (typeof input !== 'undefined') && input;
}