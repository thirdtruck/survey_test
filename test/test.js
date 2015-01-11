var assert = require('assert');
var models = require('../models');

var Question = models.Question;
var Answer = models.Answer;

var exampleQuestionTitle = 'Example Question';
var exampleAnswerTitle = 'Example Answer';

describe('Question', function() {
  this.timeout(500);

  before(function(done) {
    models.sequelize
      .sync({ force: true })
      .complete(function(err) {
        done(err);
      });
  });

  beforeEach(function(done) {
    models.Question
      .destroy({ where: true })
      .complete(function(err) {
        done(err);
      });
  });

  describe('creation', function() {
    it('should require a title', function(done) {
      createExampleQuestion(null)
      .complete(function(err, question) {
        assert.ok(err, 'Question creation should have failed');
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });

    it('should work with all required fields', function(done) {
      createExampleQuestion(exampleQuestionTitle)
      .complete(function(err, question) {
        assert.equal(err, null, 'Error thrown while creation Question');
        assert.ok(question, 'Question not created');
        assert.equal(question.title, exampleQuestionTitle, 'Title incorrect or missing');
        done();
      })
      .fail(function(err) {
        done(err);
      });
    });
  });
        
});

describe('Answer', function() {
  this.timeout(500);

  before(function(done) {
    models.sequelize
      .sync({ force: true })
      .complete(function(err) {
        done(err);
      });
  })

  beforeEach(function(done) {
    models.Question
      .destroy({ where: true })
      .complete(function(err) {
        done(err);
      });
  });

  describe('creation', function() {
    it('requires that the Answer be associated with a Question', function(done) {
      Answer
        .create({
          title: 'Example Answer' /* Also required. Covered in another test. */
        })
        /* Question association would go here. */
        .complete(function(err, answer) {
          assert.ok(err, 'Creation of an Answer not associated with a Question should have failed');
        })
        .fail(function(err) {
          done(err)
        });
    })

    it('should work with all required fields', function(done) {
      createExampleQuestion(exampleQuestionTitle)
      .complete(function(err, question) {
        assert.equal(err, null, 'Error while creating Question');
        return question;
      })
      .then(function(question) {
        Answer
          .create({
            title: exampleAnswerTitle,
            Question: question
          })
          .complete(function(err, answer) {
            assert.equal(err, null, 'Error while creating Answer');
            assert.ok(answer, 'No Answer created');
            done();
          })
          .fail(function(err) {
            done(err);
          });
      });
    });
            
  });

});

function createExampleQuestion(title) {
  return Question
           .create({ title: title });
 }
  
