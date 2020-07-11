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
  db.Article.find({ saved: true })
    .populate('note')
    .then(function (results) {
      console.log(results);
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
      return db.Article.findOneAndUpdate(
        { _id: id },
        { $push: { note: dbNote } },
        { new: true }
      );
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

module.exports = router;
