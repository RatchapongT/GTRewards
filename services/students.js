var Student = require('../models/databaseModels').Student;
var History = require('../models/databaseModels').History;
var Game = require('../models/databaseModels').Game;
var async = require('async');
var _ = require('underscore');

exports.addStudent = function (input, next) {
    var option = {
        gtID: input.gtID,
        name: input.name,
        email: input.email,
        sum: input.sum
    }
    Student.findOne({gtID: input.gtID}, function (err, student) {
        if (err) {
            return next(err);
        }
        if (student == null) {

            var newStudent = new Student(option);
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

exports.getPosition = function (input, next) {
    Student.find({}, function (err, students) {
        if (err) {
            next(err, null)
        } else {
            if (students != null) {

                var array = _.sortBy(students, 'sum')
                array = array.reverse();

                var pre = array[0].sum;
                var position = 1;
                for (var i = 0; i < array.length; i++) {

                    if(pre != array[i].sum) {
                        pre = array[i].sum;
                        position = i + 1;
                    }
                    if (array[i].gtID == input.gtID) {
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


