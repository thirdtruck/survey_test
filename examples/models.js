
var async = require('async');

function createExamples(models, done) {

  /* TODO: Replace with migration-based setup! */
  async.waterfall([
      function(callback) { models.sequelize.sync({ force: true }).complete(callback); },
      function(m, callback) { createExampleQuestions(models, callback); },
      function(questions, callback) { createExampleAnswers(models, callback); }
    ],
    function(err, result) {
      if (!!err) {
        console.log('Error: ', err);
      }
      done(err);
    });
}

function createExampleQuestions(models, callback) {
  var questionData = [
    { title: "Why don't we do it on the road?" },
    { title: "Is there life on Mars?" },
    { title: "Have you ever seen the rain?" }
  ];

  models.Question.bulkCreate(questionData).complete(function(err, questions) {
    callback(null, questions);
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

module.exports = {
  createExamples: createExamples
}
