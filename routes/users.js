var express = require('express');
var passport = require('passport');
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

router.post('/logout', function(req, res) {
  var models = req.models;
  var session = req.session;
  var uuid = session && session.uuid;

  session.destroy();

  req.models.User.update({ uuid: null }, { where: { uuid: uuid } })
    .finally(function() {
      res.redirect('/');
    });

});

router.post('/login', function(req, res, next) {
  var models = req.models;
  var session = req.session;

  console.log('Attempting login ...');

  try {
    passport.authenticate('local-login', function(err, user, info){
      console.log('local-login', arguments);
      
      if (!!err) {
        res.json({ error: err });
        return next(err);
      }
      
      res.json({ user: req.user });
    })(req, res, next);
  } catch (err) {
    console.log("Error while logging in:", err);
    res.json({ error: err });
  }
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
        res.json(user);
      }
    });
});

module.exports = router;
