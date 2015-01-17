var _ = require('underscore');
var async = require('async');
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

router.post('/', function(req, res, next) {
  var models = req.models;
  var response = models.Response.build(req.body);
  var answerID = req.body.AnswerID;
  var responderUserID = req.body.ResponderUserID;
  var session = req.session || { };

  async.waterfall([
    /* Confirming that the Answer exists before 
     * checking for the User, since we don't want 
     * to waste resources creating new anonymous 
     * Users for every bad request.
     */
    function(callback) { 
      models.Answer.find({ where: { id: answerID }})
        .complete(callback);
    },

    function(answer, callback) {
      /* It might seem like we could use 
       * #findOrCreate here, but we'll need 
       * the UUID for non-anonymous users, too.
       */
      models.User.loggedInOrAnonymous({ where: { uuid: session.uuid } })
        .complete(function(err, user) {
          session.uuid = user.uuid;
          callback(err, user, answer);
        });
    },
    
    function(existingUser, answer, callback) {
      if (_.isNull(existingUser)) {
      } else {
        callback(null, existingUser, answer);
      }
    },

    function(responder, answer, callback) {
      response.setAnswer(answer).complete(function(err) {
        callback(err, responder);
      });
    },

    function(responder, callback) {
      response.setUser(responder).complete(function(err) {
        callback(err, responder);
      });
    },

    function(responder, callback) {
      console.log('Received a new response.');
      /* Send back the UserID so that the front end 
       * can track the sessions of anonymous users.
       */
      res.json({ UserID: responder.id });
      callback();
    }
  ],

  function(err) {
    if (!!err) {
      res.status(500).json({ error: err }); 
    }
  }

  );

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
        res.json(response);
      }
    });
});

module.exports = router;
