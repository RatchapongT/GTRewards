var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose)

var userSchema = new Schema({
    username: String,
    password: String,
    created: {type: Date, default: Date.now}
});

var studentSchema = new Schema({
    gtID: String,
    lastName: String,
    firstName: String,
    email: String,
    sum: Number,
    requestedCheckout: Date,
    created: {type: Date, default: Date.now}
});

var itemSchema = new Schema({
    image: {data: String, contentType: String},
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    created: {type: Date, default: Date.now}
});

var itemLogSchema = new Schema({
    gtID: String,
    lastName: String,
    firstName: String,
    email: String,
    sum: Number,
    description: String,
    price: Number,
    quantityRequested: Number,
    created: {type: Date, default: Date.now}
});


var pendingItemsSchema = new Schema({
    _itemDetail: {type: Schema.Types.ObjectId, ref: 'Item'},
    _studentDetail: {type: Schema.Types.ObjectId, ref: 'Student'},
    _historyDetail: {type: Schema.Types.ObjectId, ref: 'History'},
    price: Number,
    quantity: Number,
    requestStamp: {type: Date, default: Date.now},
    approvedStamp: {type: Date, default: Date.now},
    approved: Boolean,
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
var Item = mongoose.model('Item', itemSchema);
var User = mongoose.model('User', userSchema);
var PendingItem = mongoose.model('PendingItem', pendingItemsSchema);
var ItemLog = mongoose.model('ItemLog', itemLogSchema);

pendingItemsSchema.plugin(deepPopulate, {});

module.exports = {
    Student: Student,
    History: History,
    Game: Game,
    Item: Item,
    ItemLog: ItemLog,
    PendingItem: PendingItem,
    User: User
};