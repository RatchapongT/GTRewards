var Student = require('../models/databaseModels').Student;

exports.addStudent = function (input, next) {
    var newStudent = new Student({
        gtID: input.gtID,
        name: input.name,
        email: input.email,
        sum: input.sum
    });

    newStudent.save(function (err) {
        if (err) {
            return next(err);
        }
        else {
            next(null);
        }
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


