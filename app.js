const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const socket_io    = require( "socket.io" );
const sharedsession = require("express-socket.io-session");

const config = require('./config/config');
const indexRouter = require('./routes/index');
const gmailRouter = require('./routes/gmail');
const outlookRouter = require('./routes/outlook');

var app = express();

// Socket.io
var io = socket_io();
app.io = io;

const socketRouter = require('./sockets/socket')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware for managing session https://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
var sessionMiddleware = session({
    secret: config.mySecretPhrase,
    resave: true,
    saveUninitialized: true
});

// Use express-session middleware for express
app.use(sessionMiddleware);

// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(sessionMiddleware, {
    autoSave:true
}));

// Middleware for processing POST variables
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/gmail', gmailRouter);
app.use('/outlook', outlookRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    if (req.accepts('json') && !req.accepts('html')) {
        res.status(404).send({
            error: 'Not found'
        });
    } else {
        res.status(404).render('error404', {
            title: "Sorry, page not found"
        });
    }
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.log('Error: ');
    console.log(err);
    if (req.accepts('json') && !req.accepts('html')) {
        res.send({
            'error': true
        });
    } else {
        res.render('error');
    }
});

module.exports = app;
