var Student = require('../models/databaseModels').Student;

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



exports.deleteUser = function (input, res, next) {
    User.findById(input, function (err, object) {
        if (err) return next(err);
        object.remove(function (err) {
            res(err);
        });
    });
};


