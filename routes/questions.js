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
      
      var notYetAnsweredQuestionIDsQuery = models.sequelize.query('SELECT id FROM Questions WHERE Questions.id NOT IN (SELECT Questions.id FROM Responses JOIN Answers ON Responses.AnswerId = Answers.id JOIN Questions ON Answers.QuestionId = Questions.Id WHERE Responses.UserId = :userId);', models.Question, {}, { userId: user.id })
        .complete(function(err, questions) {
          if (!!err) {
            res.status(500).json({ error: err }); 
            throw err;
          }

          if (questions.length === 0) {
            res.json({ /* Empty response. */ });
            return;
          }

          var randomQuestionID = _(questions)
                                    .chain()
                                    .pluck('id')
                                    .sample()
                                    .value();
                                    
          getQuestionByID(randomQuestionID, models, res);
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
