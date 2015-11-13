var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var crypto = require('crypto');


var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    },


})

var upload = multer({
    onFileUploadStart: function (file) {
        console.log("YIII");
    },
    storage: storage
})
// Database
var mongoose = require('mongoose');
var passport = require('passport');
var expressSession = require('express-session');
var connectMongo = require('connect-mongo');
var flash = require('connect-flash');
var config = require('./config');
var routes = require('./routes/index');

var restrict = require('./auth/restrict');
var match = require('./routes/match');


var MongoStore = connectMongo(expressSession);
var passportConfig = require('./auth/passport-config');
passportConfig();
mongoose.connect(config.mongoUri);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(upload.single('ExcelFile'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(expressSession(
    {
        secret: 'getting good money',
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }
));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/match', match);


app.post('/upload', upload.single('ExcelFile'), function (req, res, next) {
    res.redirect('/processing/' + req.file.name);
})

app.use(restrict);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('errorMessage', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
