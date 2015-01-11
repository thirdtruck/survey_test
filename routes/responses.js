var express = require('express');
var router = express.Router();

router.get('/count', function(req, res) {
  var models = req.models;

  models.Response
    .count()
    .complete(function(err, count) {
      if (!!err) {
        console.log("Unable to fetch the total number of responses: ", err);
        res.json({ error: err });
      } else {
        res.json({ count: count });
      }
    });
});

router.get('/:id', function(req, res) {
  var models = req.models;

  models.Response
    .find({ where: { id: req.params.id }})
    .complete(function(err, response) {
      if (!!err) {
        console.log("Unable to fetch a response: ", err);
        res.json({ error: err });
      } else {
        res.json({ response: response });
      }
    });
});

module.exports = router;
