/**
 * AUTHOR: JEFFERSON JOHANNES ROTH FILHO (jjrothfilho@gmail.com)
 */

// APP
const express = require('express');
const app = express();
const axios = require('axios');

// CONF_APP
const PATH_DB = './server/db/';
const PATH_VIEWS = './server/views/';
const PATH_PUBLIC = './public';
app.locals.pretty = true;   // PRETTY HTML
app.set('port', process.env.PORT || 3000);
//app.set('views', __dirname + '/server/views');

// BODY PARSER
var BODY_PARSER = require('body-parser');
var JSON_PARSER = BODY_PARSER.json();
var URLENCODED_PARSER = BODY_PARSER.urlencoded({ extended: false });
app.use(BODY_PARSER.json());
app.use(BODY_PARSER.urlencoded({ extended: true }));
app.use(BODY_PARSER.raw({ type: 'application/vnd.api+json' }))
//app.use(BODY_PARSER.json({ type: 'application/vnd.api+json' }));
// MIDDLEWARE
app.use('/public', express.static('public'));

/**
 * LIQUIDM
 */
var LIQUIDM_ROUTES = './liquidm';
require(LIQUIDM_ROUTES)(app);

/**
 * index
 */
app.get('/',function(req,res){
    res.sendFile(__dirname + '/views/index.html');
});

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Chokidar
var chokidar = require('chokidar')
var watcher = chokidar.watch('./server')
watcher.on('ready', function() {
  watcher.on('all', function() {
    console.log("Clearing /app/ module cache from server");
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
    })
  })
});
var watcherLiquidM = chokidar.watch('./liquidm')
watcherLiquidM.on('ready', function() {
  watcherLiquidM.on('all', function() {
    console.log("Clearing /liquidm/ module cache from server");
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
    })
  })
});

app.get('*', function(req, res) { res.sendFile(__dirname + '/views/404.html'); });

app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});