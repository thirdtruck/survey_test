"use strict";

var _ = require('underscore');
var express = require('express');
var router = express.Router();
var async = require('async');

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
            res.json({ noQuestionsLeft: true });
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

router.post('/', function(req, res) {
  var userData = req.body.user;
  var answersData = req.body.answers;
  var questionTitle = req.body.title;
  var models = req.models;

  if (!userData || !answersData || !questionTitle
      || !userData.id || !userData.uuid) {
    console.log(userData, answersData, questionTitle);
    console.log(req.body);
    res.status(400).json({ error: 'Missing parameters.' });
    return;
  }

  /* TODO: Should we bother checking the session UUID, too? */

  /* We're going to chain a _lot_ of methods here, but only 
   * because Sequelize doesn't yet support simultaneous 
   * instance creation and association assignment. Even 
   * #set[Association] calls #save automatically.
   */

  async.waterfall([
    function(callback) {
      models.User
        .find({
          where: {
            id: userData.id,
            uuid: userData.uuid,
            anonymous: false
          }
        })
        .complete(function(err, user) {
          if (!!err) {
            callback(err);
            return;
          }

          if (!user) {
            res.status(401).json({ error: 'Missing or invalid login session.' });
            callback(null);
            return;
          }

          callback(null, user);
        });
    },
    function(user, callback) {
      models.Question
        .create({ title: questionTitle })
        .complete(function(err, question) {
          if (!!err) {
            console.log('Error while creating question:', err);
            callback(err);
            return;
          }

          callback(null, user, question);
        });
    },
    function(user, question, callback) {
      question.setUser(user)
        .complete(function(err) {
          if (!!err) {
            callback(err);
            return;
          }

          callback(null, user, question);
        });
    },
    function(user, question, callback) {
      function createAnswer(answerData, onCreateCallback) {
        models.Answer
          .create(answerData)
          .complete(onCreateCallback)
      };
      
      async.map(answersData, createAnswer, function(err, answers) {
        if (!!err) {
          callback(err);
          return;
        }

        callback(null, user, question, answers);
      });
    },
    function(user, question, answers, callback) {
      function assignQuestion(answer, onAssignCallback) {
        answer
          .setQuestion(question)
          .complete(onAssignCallback)
      };
      
      async.each(answers, assignQuestion, function(err, answers) {
        if (!!err) {
          callback(err);
          return;
        }

        callback(null, user, question, answers);
      });
    }
  ], function(err, result) {
    if (!!err) {
      console.log('Error while submitting a new question:', err);
      res.status(500).json({ error: err });
      return;
    }

    res.json({ message: 'New question submitted successfully.' });
  });
});

module.exports = router;
