var assert = require('assert');
var models = require('../models');

var Question = models.Question;

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

  describe("Create a Question", function() {
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
            throw new Exception('No question returned.');
          }

          if (!question.title) {
            throw new Exception('Title missing from question.');
          }

          done();
        })
    });
  });
        
});
