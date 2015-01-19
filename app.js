var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'an example secret',
  name: 'surveyuser',
  resave: true,
  saveUninitialized: true
}));

// Set up authentication
passport.use('local-login', new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, login, password, done) {
    console.log('Starting login check');
    models.User.findOne({ where: { login: login } })
      .complete(function(err, user) {
        console.log('Comparing password');
        if (!!err) {
          console.log('Error', err);
          return done(err);
        }

        if (!user) {
          console.log('User not found');
          return done(null, false);
        }

        if (!user.validPassword(password)) {
          console.log('Invalid password');
          return done(null, false);
        }

        console.log('Valid login!');
        return (null, user);
      });
   })
);

app.use(passport.initialize());

var usersRoutes = require('./routes/users');
var questionsRoutes = require('./routes/questions');
var answersRoutes = require('./routes/answers');
var responsesRoutes = require('./routes/responses');

/* Make the ORM accessible to our router. */
app.use(function(req, res, next) {
  req.models = models;
  next();
});

app.use('/users', usersRoutes);
app.use('/questions', questionsRoutes);
app.use('/answers', answersRoutes);
app.use('/responses', responsesRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
