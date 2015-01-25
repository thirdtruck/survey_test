
var async = require('async');
var bcrypt = require('bcrypt');

function createExamples(models, done) {

  /* TODO: Replace with migration-based setup! */
  async.waterfall([
      function(callback) { models.sequelize.sync({ force: true }).complete(callback); },
      function(m, callback) { createExampleUsers(models, callback); },
      function(users, callback) { createExampleQuestions(models, users, callback); },
      function(questions, users, callback) { createExampleAnswers(models, callback); },
      /*
      function(users, callback) { createExampleResponses(models, callback); },
      */
    ],
    function(err, result) {
      if (!!err) {
        console.log('Error: ', err);
      }
      done(err);
    });
}

function createExampleQuestions(models, users, callback) {
  /* TODO: Assign these to the example users. */
  var questionsData = [
    { title: "Why don't we do it on the road?", userIndex: 0 },
    { title: "Is there life on Mars?", userIndex: 0 },
    { title: "Have you ever seen the rain?", userIndex: 1 }
  ];

  async.map(questionsData, function(questionData, mapCallback) {
    models.Question
      .create(questionData)
      .complete(function(err, question) {
        if (!!err) {
          callback(err);
          return;
        }

        var user = users[questionData.userIndex];

        question
          .setUser(user)
          .complete(mapCallback);
      });
  }, function(err, questions) {
    callback(err, questions, users);
  });

}

function createExampleAnswers(models, callback) {
  var allAnswerData = [
    { title: "Because it's cold outside!", questionIndex: 0 },
    { title: "Because there's a chicken in the way.", questionIndex: 0 },
    { title: "Yes", questionIndex: 1 },
    { title: "No", questionIndex: 1 },
    { title: "Yes, and it's beautiful.", questionIndex: 2 },
    { title: "Yes, now where's my umbrella?", questionIndex: 2 }
  ];

  var allCallbacks = [
    /* TODO: Do we actually need to perform this #findAll first?
       How else can we make sure that the changes have already been made?
    */
    function(callback) { models.Question.findAll().complete(callback); },
  ];

  for (var answerIndex in allAnswerData) {
    allCallbacks.push(buildAnswerCreationCallback(answerIndex));
  }

  function buildAnswerCreationCallback(answerIndex) {
    var answerData = allAnswerData[answerIndex];
    
    return function(questions, callback) {
      models.Answer.create({ title: answerData.title })
        .then(function(answer) {
          answer
            .setQuestion(questions[answerData.questionIndex])
            .then(function(answer) { callback(null, questions); })
        });
    };
  }

  async.waterfall(allCallbacks,
    function(err, result) {
      callback(err);
    });
}

function createExampleUsers(models, callback) {
  var salt = bcrypt.genSaltSync(10);
  var usersData = [
    { login: 'alice', passwordHash: bcrypt.hashSync("12345", salt) },
    { login: 'betty', passwordHash: bcrypt.hashSync("qwerty", salt) }
  ];

  async.map(usersData, function(userData, mapCallback) {
      models.User
        .create(userData)
        .complete(mapCallback);
    },
    function(err, users) {
      callback(err, users);
    }
  );
}

function createExampleResponses(models, responsesCreated) {
  var allResponseData = [
    { userId: 1, answerId: 1 },
    { userId: 2, answerId: 2 }
  ];

  var allCallbacks = [
    /* TODO: Do we actually need to perform these calls to #findAll first?
       How else can we make sure that the changes have already been made?
    */
    function(callback) { models.User.findAll().complete(callback); },
    function(users, callback) {
      models.Answer.findAll().complete(function(err, answers) {
        callback(err, users, answers);
      });
    }
  ];

  for (var responseIndex in allResponseData) {
    allCallbacks.push(buildResponseCreationCallback(responseIndex));
  }

  function buildResponseCreationCallback(responseIndex) {
    var responseData = allResponseData[responseIndex];

    return function(users, answers, callback) {
      models.Response.create({
        UserId: responseData.userId,
        AnswerId: responseData.answerId
      })
      .then(function(response) {
        callback(null, users, answers);
      });
    };
  }

  async.waterfall(allCallbacks,
    function(err, result) {
      responsesCreated(err);
    });
}

module.exports = {
  createExamples: createExamples
};
