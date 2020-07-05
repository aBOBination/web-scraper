var express = require('express');
var axios = require('axios');
var cheerio = require('cheerio');
var db = require('../models');
var router = express.Router();

router.get('/', function (req, res) {
  db.Article.find({}).then(function (results) {
    var data = {
      scrape: results.map((row) => {
        return { title: row.title, link: row.link };
      })
    };
    res.render('index', data);
  });
});

router.get('/api/fetch', function (req, res) {
  axios.get('https://www.nytimes.com/').then(function (response) {
    var $ = cheerio.load(response.data);
    var results = [];
    $('.css-6p6lnl').each(function (i, element) {
      var result = {};
      result.title = $(this).children('a').text();
      result.link = $(this).children('a').attr('href');
      db.Article.find({ link: result.link })
        .then(function (data) {
          if (data.length === 0) {
            db.Article.create(result)
              .then(function () {
                // results.push(result);
              })
              .catch(function (err) {
                console.log(err);
              });
          } else {
          }
          results.push(result);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    var data = {
      scrape: results
    };
    res.render('index', data);
  });
});

router.get('/api/headlines', function (req, res) {
  db.Article.find({ saved: false })
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.delete('/api/clear', function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.remove({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
    });
});

module.exports = router;
