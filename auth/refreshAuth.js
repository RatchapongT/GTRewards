var PendingItem = require('../models/databaseModels').PendingItem;

module.exports = function (req, res, next) {
    if (req.isAuthenticated()) {
        PendingItem.find({approved: false}, function (err, pendingItem) {
            var temp = req.user.username;
            req.user = {
                username: temp,
                approveCount: pendingItem.length
            }
            return next();
        })

    } else {
        return next();
    }
};