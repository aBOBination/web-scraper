var express = require('express');
var mongoose = require('mongoose');

var axios = require('axios');
var cheerio = require('cheerio');
var db = require('../models');
const { json } = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  db.Article.find({ saved: false }).then(function (results) {
    var data = {
      scrape: results.map((row) => {
        return {
          _id: row._id,
          title: row.title,
          link: row.link,
          summary: row.summary
        };
      })
    };
    res.render('index', data);
  });
});

router.get('/saved', function (req, res) {
  db.Article.find({ saved: true }).then(function (results) {
    var data = {
      scrape: results.map((row) => {
        return {
          _id: row._id,
          title: row.title,
          link: row.link,
          summary: row.summary
        };
      })
    };
    res.render('saved', data);
  });
});

router.get('/api/fetch', function (req, res) {
  axios.get('https://www.nytimes.com/').then(function (response) {
    var $ = cheerio.load(response.data);
    var results = [];
    $('.css-6p6lnl').each(function (i, element) {
      var result = {};
      result.title = $(this).children('a').find('.e1voiwgp0').text();
      result.link = $(this).children('a').attr('href');
      result.summary = $(this).children('a').find('p').text();
      db.Article.find({ link: result.link })
        .then(function (data) {
          if (data.length === 0) {
            db.Article.create(result)
              .then(function () {})
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
  db.Article.deleteMany({ saved: false })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.delete('/api/clear/:id', function (req, res) {
  const id = req.params.id;
  db.Article.deleteOne({ _id: id })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.put('/api/headlines/:id', function (req, res) {
  const id = req.params.id;
  const payload = {
    saved: true
  };
  db.Article.updateOne({ _id: id }, { $set: payload })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.post('/api/notes', function (req, res) {
  const id = mongoose.Types.ObjectId(req.body.id);
  const title = req.body.title;
  const body = req.body.body;
  const payload = {
    title: req.body.title,
    body: req.body.body
  };

  db.Note.create(payload)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

  // db.Article.updateOne({ _id: id }, { $push: { Note: payload } })
  //   .then(function (dbArticle) {
  //     console.log('success');
  //     console.log(dbArticle);
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   });

  // db.Article.findOne({ _id: id })
  //   .populate('note')
  //   .exec((err, payload) => {
  //     payload;
  //     console.log('Populated Note ' + payload);
  //   });

  // db.Note.create(payload)
  //   .then(function () {})
  //   .catch(function (err) {
  //     console.log(err);
  //   });
});

module.exports = router;
