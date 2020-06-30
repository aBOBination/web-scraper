var express = require('express');
var logger = require('morgan');
var PORT = 3000;
var app = express();
var routes = require('./routes/routes.js');
var mongoose = require('mongoose');

// Use morgan logger for logging requests
app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Make public a static folder
app.use(express.static('public'));

app.use(routes);

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/webScraper';
mongoose.connect(MONGODB_URI);

// Start the server
app.listen(PORT, function () {
  console.log('App running on port ' + PORT + '!');
});
