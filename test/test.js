var assert = require('assert');
var models = require('../models');

var Question = models.Question;
var Answer = models.Answer;

describe('Question', function() {
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

  describe('Create a Question', function() {
    it('should save without error', function(done) {
      Question
        .create({ title: 'Example Question' })
        .complete(function(err, question) {
          if (err) {
            throw err;
          };

          done();
        })
    });

    it('should create a question with the given title', function(done) {
      Question
        .create({ title: 'Example Question' })
        .complete(function(err, question) {
          if (err) {
            throw err;
          };

          if (!question) {
            throw 'No question returned.';
          }

          if (!question.title) {
            throw 'Title missing from question.';
          }

          done();
        })
    });
  });
        
});

describe('Answer', function() {
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

  describe('Create an Answer', function() {
    it('must be associated with a Question', function(done) {
      Answer
        .create({
          title: 'Example Answer' /* Also required. Covered in another test. */
          /* Question association would go here. */
        })
        .complete(function(err, answer) {
          if (err) {
            done(); /* TODO: Check for a more specific error, if possible. */
          } else {
            throw 'Answers must be associated with a Question.';
          }
        });
    })
  });

});


