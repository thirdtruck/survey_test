var _ = require('underscore');
var express = require('express');
var passport = require('passport');
var router = express.Router();
var nodeUUID = require('node-uuid');

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

  session.uuid = session.uuid || nodeUUID.v4();

  passport.authenticate('local-login', function(err, user, info){
    console.log('local-login', arguments);
    
    if (!!err) {
      throw err;
    }

    if (!user) {
      res.status(401).json({ error: "Login failed." });
      return;
    }

    user.uuid = session.uuid;
    user
      .save()
      .complete(function(err) {
        if (!!err) {
          throw err;
        }
        
        res.json({ user: _(user).pick('id', 'uuid') });
      });

  })(req, res, next);
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
