var assert = require('assert');
var async = require('async');
var models = require('../models');

var Question = models.Question;
var Answer = models.Answer;
var User = models.User;
var Response = models.Response;

var exampleQuestionTitle = 'Example Question';
var exampleAnswerTitle = 'Example Answer';

function syncDatabase(done) {
  models.sequelize
    .sync({ force: true })
    .complete(function(err) {
      done(err);
    });
}

function emptyDatabase(done) {
  async.waterfall([
    function(callback) { Question.destroy({ where: true }).catch(callback).finally(callback); },
    function(callback) { Answer.destroy({ where: true }).catch(callback).finally(callback); },
    function(callback) { User.destroy({ where: true }).catch(callback).finally(callback); },
    function(callback) { Response.destroy({ where: true }).catch(callback).finally(callback); },
  ],
  function(err, result) {
    done(err);
  });
}

function createExampleQuestion(title) {
  if (arguments.length == 0) {
    title = exampleQuestionTitle;
  }

  return Question.create({ title: title });
}

function createExampleAnswer(question, title) {
  if (arguments.length < 2) {
    title = exampleAnswerTitle;
  }

  if (arguments.length < 1) {
    return createExampleQuestion().then(function(question) {
      createCallback(question);
    });
  }

  return createCallback(question);

  function createCallback(question) {
    return Answer.create({
      title: title
    })
    .then(function(answer) {
      answer.setQuestion(question);
      return answer;
    });
  };
}

function createExampleUser() {
  return User.create();
}

function createExampleResponse(answer, user) {
  return Response
    .create()
    .then(function(response) {
      response.setAnswer(answer);
      response.setUser(user);
      return response;
    });
}

var includeGlobally = {
  exampleQuestionTitle: exampleQuestionTitle,
  exampleAnswerTitle: exampleAnswerTitle,
  syncDatabase: syncDatabase,
  emptyDatabase: emptyDatabase,
  createExampleQuestion: createExampleQuestion,
  createExampleAnswer: createExampleAnswer,
  createExampleUser: createExampleUser,
  createExampleResponse: createExampleResponse
};

function importAllTestVariablesInto(namespace) {
  for (var key in includeGlobally) {
    namespace[key] = includeGlobally[key];
  }
}

module.exports = { importAllTestVariablesInto : importAllTestVariablesInto };

