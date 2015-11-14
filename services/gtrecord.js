var User = require('../models/databaseModels').Student;

exports.addStudent = function (input, next) {
    var newStudent = new Student({
        username: input.gtID,
        name: input.name,
        email: input.email,
        sum: input.sum
    });

    bcrypt.hash(input.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }

        input.password = hash;
        var newUser = new User({
            username: input.username,
            password: input.password
        });

        newUser.save(function (err) {
            if (err) {
                return next(err);
            }

            var newUserDetail = new UserDetail({
                _userDetail: newUser._id,
                interest: input.interest,
                accountType: input.accountType,
                profilePicture: "default",
            });

            newUserDetail.save(function (err) {
                if (err) {
                    return next(err);
                }
                else {
                    next(null);
                }

            });

        });
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


