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

  async.waterfall([
    function(callback) { 
      models.Answer.find({ where: { id: answerID }})
        .complete(callback);
    },
    
    function(answer, callback) {
      var getResponderPromise;
      
      if (_.isUndefined(responderUserID)) {
        console.log('Creating a new anonymous user.');
        getResponderPromise = models.User.create({
            anonymous: true
          });
      } else {
        getResponderPromise = models.User.find({
          where: { id: responderUserID }
        });
      }
      
      getResponderPromise.complete(function(err, responder) {
        callback(err, answer, responder)
      });
    },

    function(answer, responder, callback) {
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
