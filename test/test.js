var assert = require('assert');
var async = require('async');
var models = require('../models');

var Question = models.Question;
var Answer = models.Answer;
var User = models.User;
var Response = models.Response;

require('./common').importAllTestVariablesInto(global);

describe('Question', function() {
  before(function(done) {
    syncDatabase(done);
  });

  beforeEach(function(done) {
    emptyDatabase(done);
  });

  describe('creation', function() {
    it('should require a title', function(done) {
      createExampleQuestion(null)
      .complete(function(err, question) {
        assert.ok(err, 'Question creation should have failed');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('should work with all required fields', function(done) {
      createExampleQuestion()
      .complete(function(err, question) {
        assert.equal(err, null, 'Error thrown while creation Question');
        assert.ok(question, 'Question not created');
        assert.equal(question.title, exampleQuestionTitle, 'Title incorrect or missing');
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });
  });
        
});

describe('Answer', function() {
  before(function(done) {
    syncDatabase(done);
  })

  beforeEach(function(done) {
    models.Question
      .destroy({ where: true })
      .complete(function(err) {
        done(err);
      });
  });

  describe('creation', function() {
    it('should require a title', function(done) {
      Answer
        .create({
          title: null
        })
        .complete(function(err, answer) {
          assert.ok(err, 'Answer creation should have catched');
          done();
        })
        .catch(function(err) {
          done(err)
        });
    })

    it('should work with all required fields', function(done) {
      async.waterfall([
        function(callback) { createExampleQuestion().catch(callback).complete(callback); },
        function(question, callback) { createExampleAnswer(question).catch(callback).complete(callback); },
        function(answer, callback) {
          assert.ok(answer, 'Answer missing');
          callback();
        }
      ],
      function(err, result) {
        console.log(arguments);
        done(err);
      });
    });
            
  });

});

describe('User', function() {
  before(function(done) {
    syncDatabase(done);
  });

  beforeEach(function(done) {
    emptyDatabase(done);
  });
});

