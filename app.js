var express = require('express')
var swig = require('swig')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var index = require('./routes/index')
var mobile = require('./routes/app')
var users = require('./routes/users')
var bwa = require('./routes/bwa')
var session = require("express-session")

var app = express()

// view engine setup
app.engine('html', swig.renderFile)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
  secret: 'fatherbook-server',
  resave: false,
  saveUninitialized: true,
  store: new session.MemoryStore(),
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/mobile', mobile)
app.use('/users', users)
app.use('/bwa', bwa)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})


module.exports = app
