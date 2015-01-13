var express = require('express');
var router = express.Router();

router.get('/count', function(req, res) {
  var models = req.models;

  models.User
    .count()
    .complete(function(err, count) {
      if (!!err) {
        console.log("Unable to fetch the total number of users: ", err);
        res.json({ error: err });
      } else {
        res.json({ count: count });
      }
    });
});

router.get('/:id', function(req, res) {
  var models = req.models;

  models.User
    .find({
      where: { id: req.params.id },
      include: [
        {
          model: models.Response,
          include: [
            {
              model: models.Answer,
              include: [models.Question]
            }
          ]
        }
      ]
    })
    .complete(function(err, user) {
      if (!!err) {
        console.log("Unable to fetch a user: ", err);
        res.json({ error: err });
      } else {
        res.json({ user: user });
      }
    });
});

module.exports = router;
