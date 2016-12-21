var path        = require('path');
var express     = require('express');
var bodyParser      = require('body-parser');
var cookieParser =require('cookie-parser');
var session=require('express-session');



var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var couponTemplate     = require('./routes/coupontemplate');
var couponInstance     = require('./routes/couponinstance');
//use some properties

// 使用这个中间件之后才能通过req.body获取参数
//app.use(bodyParser.json({limit: '1mb'}));
//app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//add routes
app.use('/coupontemplate', couponTemplate );
app.use('/couponinstance', couponInstance );

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err,
        error: {}
    });
});
module.exports = app;
