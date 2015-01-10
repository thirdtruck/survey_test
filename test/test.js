var assert = require('assert');
var models = require('../models');

var Question = models.Question;

describe('Question', function() {
  beforeEach(function(done) {
    models.sequelize
      .sync({ force: true })
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
  });
        
});
