var express = require('express.io');
var app = express().http().io();
var bbcode = require('bbcode');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
var stringUtil = require('./lib/stringUtil.js');
var intNat = require('./lib/intNat.js');
var usernames = {};
var messages = [];
var secretFile = require('./session-secret.json');
var secret = secretFile['session-secret'];
var emojione = require('emojione');
emojione.sprites = true;
emojione.ascii = true;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({secret: secret}));
app.set('server_username', 'SERVER');
intNat.load('de');

// Setup the ready route, and emit talk event.

app.io.route('login', login);
app.io.route('sendchat', sendchat);
app.io.route('disconnect', disconnect);

app.io.route('ready', function(req) {
    req.io.emit('talk', {
        message: 'io event from an io route on the server'
    })
})

// Send the client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
})

function login(req) {
	var username = req.data;
  validateUsername(username, function(error) {
    if (error) return req.io.emit('error', error);
    username = stringUtil.escapeHTML(username).trim();
    req.session.username = username;
    req.session.save();
    usernames[username] = username;
    req.io.emit('login', username);
    loadMessages(req);
    // req.io.emit('updatechat', {
    // 	'username': app.get('server_username'),
    // 	'message': intNat.T('user.youConnected')
    // });
    app.io.broadcast('updatechat', {
    	'username': app.get('server_username'),
    	'message': intNat.T("user.hasConnected", username)
    });
    req.io.emit('updateusers', usernames);
    app.io.broadcast('updateusers', usernames);
  });
}

function sendchat(req) {
  var message = req.data;
  validateMessage(req.session.username, message, function(error) {
    if (error) return req.io.emit('error', error);
    message = stringUtil.escapeHTML(message).trim();
    bbcode.parse(message, function(content) {
      content = emojione.shortnameToImage(content);
      content = emojione.unicodeToImage(content); 
      content = stringUtil.convertLinks(content);
      var time = new Date();
      messages.push({ "username" : req.session.username, "time" : time, "message" : content });
      if (messages.length > app.get('saved_messages_count')) messages.shift();
      app.io.broadcast('updatechat', {
      	'username': req.session.username,
      	'message': content,
      	'time': time
      });
    });
  });
}

function disconnect(req) {
 	 if (req.session && req.session.username) {
    delete usernames[req.session.username];
    app.io.broadcast('updateusers', usernames);
    app.io.broadcast('updatechat', {
    	'username': app.get('server_username'),
    	'message': intNat.T("user.logedout",req.session.username)
    }); 
  }
}

function loadMessages(req) {
  for (var i in messages) {
    req.io.emit('updatechat', {
    	'username': messages[i].username,
    	'message': messages[i].message,
    	'time': messages[i].time
    });
  }
}

function validateUsername(username, callback) {
  var MAX_LENGTH = 20;
  var MIN_LENGTH = 4;
  if (!username || username.trim().length < 1) {
     callback(intNat.T("error.NoUsername"));
     return;
  }
  if (usernames[username] || username == app.get('server_username')) {
    callback(intNat.T("error.UsernameChoosen"));
    return;
  }
  if (username.length > MAX_LENGTH) {
    callback(intNat.T("error.toLongUsername"));
    return;
  }
  if (username.length < MIN_LENGTH) {
    callback(intNat.T("error.toShortUsername"));
    return;
  }
  callback();
}

function validateMessage(username, message, callback) {
  var MAX_LENGTH = 300;
  var MIN_LENGTH = 1;
  if (!username) {
    callback(intNat.T("error.notLoggedIn"));
    return;
  }
  if (!message || message.trim().length < MIN_LENGTH) {
    callback(intNat.T("error.noMessage"));
    return;
  }
  if (message.length > MAX_LENGTH) {
    callback(intNat.T("error.longMessage"));
    return;
  }
  callback();
}


app.listen(8080);
