var express = require('express');
var router = express.Router();

router.get('/count', function(req, res) {
  var models = req.models;

  models.Question
    .count()
    .complete(function(err, count) {
      if (!!err) {
        console.log("Unable to fetch the total number of questions: ", err);
        res.json({ error: err });
      } else {
        res.json({ count: count });
      }
    });
});

router.get('/:id', function(req, res) {
  var models = req.models;

  models.Question
    .find({ id: req.params.id })
    .complete(function(err, question) {
      if (!!err) {
        console.log("Unable to fetch a question: ", err);
        res.json({ error: err });
      } else {
        res.json({ question: question });
      }
    });
});

module.exports = router;
