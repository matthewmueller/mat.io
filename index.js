/**
 * Module dependencies.
 */

var port = process.argv[2] || 3000,
    express = require('express'),
    app = module.exports = express(),
    auth = require(process.env.HOME + '/credentials.json').simplenote;

/**
 * Configuration
 */

app.use(express.favicon(__dirname + '/favicon.ico'));
app.use(express.bodyParser());

app.configure('production', function() {
  app.use(express.compress());
});

app.use(express.static(__dirname + '/build'));

app.configure('development', function(){
  app.use(require('build'));
  app.use(express.logger('dev'));
});

/**
 * Mount
 */

app.use(require('feed'));
app.use(require('post'));
app.use(require('home'));
app.use(require('deploy'));

app.configure('development', function() {
  app.use(express.errorHandler());
});

/**
 * Periodically query simple note for changes
 */

var Simplenote = require('simplenote-sync');

var simplenote = Simplenote({
  email : auth.email,
  password : auth.password,
  model : require('post/model'),
  tag : 'mat.io'
});

setInterval(function() {
  simplenote.sync(function(err) {
    if(err) console.error(err);
  });
}, random(30, 60) * 1000);

simplenote.sync(function(err) {
  if(err) console.error(err);
  else console.log('all synced!');
});

/**
 * Listen
 */

app.listen(port, function() {
  console.log("listening on port %s", port);
});

/**
 * Graceful shutdown
 */

function shutdown() {
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);

/**
 * Random number between `min` and `max`
 */

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
