var express = require('express');
var axios = require('axios');
var cheerio = require('cheerio');
var db = require('../models');
var router = express.Router();

router.get('/', function (req, res) {
  // First, we grab the body of the html with axios

  axios.get('https://www.nytimes.com/').then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector

    var $ = cheerio.load(response.data);
    var results = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $('.css-6p6lnl').each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
      results.push(result);
    });

    // Send a message to the client

    var data = {
      scrape: results
    };
    console.log(data);
    res.render('index', data);
  });
});

// A GET route for scraping the echoJS website
router.get('/api/fetch', function (req, res) {
  // First, we grab the body of the html with axios
  axios.get('https://www.nytimes.com/').then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector

    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $('.css-6p6lnl').each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send('Scrape Complete');
  });
});

// Route for getting all Articles from the db
router.get('/articles', function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get('/articles/:id', function (req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
router.post('/articles/:id', function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

module.exports = router;
