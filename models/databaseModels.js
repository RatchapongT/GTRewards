var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
    gtID: String,
    name: String,
    email: String,
    sum: Number,
    created: {type: Date, default: Date.now}
});

var historySchema = new Schema({
    _studentDetail: {type: Schema.Types.ObjectId, ref: 'Student'},
    description: String,
    points: Number,
    date: String,
    created: {type: Date, default: Date.now}
});

var gameSchema = new Schema({
    date: String,
    name: String,
    points: Number,
    created: {type: Date, default: Date.now}
});




var History = mongoose.model('History', historySchema);
var Game = mongoose.model('Game', gameSchema);
var Student = mongoose.model('Student', studentSchema);

module.exports = {
    Student: Student,
    History: History,
    Game: Game
};