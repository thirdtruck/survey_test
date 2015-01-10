var express = require('express');
var router = express.Router();

router.get('/count', function(req, res) {
  var models = req.models;

  models.Question
    .count()
    .complete(function(err, count) {
      if (!!err) {
        console.log("Unable to fetch the total number of answers: ", err);
        res.json({ error: err });
      } else {
        res.json({ count: count });
      }
    });
});

router.get('/:id', function(req, res) {
  var models = req.models;

  models.Question
    .find({ where: { id: req.params.id }})
    .complete(function(err, answer) {
      if (!!err) {
        console.log("Unable to fetch an answer: ", err);
        res.json({ error: err });
      } else {
        res.json({ answer: answer });
      }
    });
});

module.exports = router;
