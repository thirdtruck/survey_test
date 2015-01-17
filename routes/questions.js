"use strict";

var _ = require('underscore');
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

router.get('/random', function(req, res) {
  var session = req.session || { };
  var models = req.models;
  
  models.User.loggedInOrAnonymous({ where: { uuid: session.uuid } })
    .complete(function(err, user) {
      session.uuid = user.uuid;

      models.Question.findAll({ attributes: ['id'] })
        .catch(function(err) {
          res.status(500).json({ error: err }); 
        })
        .then(function(questions) {
          if (questions.length === 0) {
            res.status(500).json({ error: 'No questions available.' });
            return;
          }
          
          var questionID = _.sample(questions).id;

          getQuestionByID(questionID, models, res);
        });
    });

});

router.get('/:id', function(req, res) {
  getQuestionByID(req.params.id, req.models, res);
});

function getQuestionByID(id, models, res) {
  models.Question
    .find({
      where: { id: id },
      include: [models.Answer]
    })
    .complete(function(err, question) {
      if (!!err) {
        console.log("Unable to fetch a question: ", err);
        res.json({ error: err });
      } else {
        res.json(question);
      }
    });
}

module.exports = router;
