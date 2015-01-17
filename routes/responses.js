var _ = require('underscore');
var express = require('express');
var router = express.Router();

router.get('/count', function(req, res) {
  var models = req.models;

  models.Response
    .count()
    .complete(function(err, count) {
      if (!!err) {
        console.log("Unable to fetch the total number of responses: ", err);
        res.json({ error: err });
      } else {
        res.json({ count: count });
      }
    });
});

router.post('/', function(req, res, next) {
  var models = req.models;
  var response = models.Response.build(req.body);
  var answerID = req.body.AnswerID;
  var responderUserID = req.body.ResponderUserID;
  console.log(answerID, req.body);

  try {
    models.Answer
      .find({ where: { id: answerID }})
      .catch(function(err) { res.status(500).json({ error: err }); })
      .then(function(answer) {
        var getResponderPromise;
        
        if (_.isUndefined(responderUserID)) {
          console.log('Creating a new anonymous user.');
          getResponderPromise = models.User.create({
              anonymous: true
            });
        } else {
          getResponderPromise = models.User.find({
            where: { id: responderUserID }
          });
        }

        getResponderPromise
          .catch(function(err) { res.status(500).json({ error: err }); })
          .then(function(responder) {
            console.log(answer, answer.get('id'));
            response.setAnswer(answer)
              .catch(function(err) { res.status(500).json({ error: err }); })
              .then(function() {
                response.setUser(responder)
                  .catch(function(err) { res.status(500).json({ error: err }); })
                  .then(function() {
                    console.log('Received a new response.');
                    res.json({ UserID: responder.id });
                  });
              });
          })
            
      });
  } catch (err) {
    res.json(err);
  }

});

router.get('/:id', function(req, res) {
  var models = req.models;

  models.Response
    .find({ where: { id: req.params.id }})
    .complete(function(err, response) {
      if (!!err) {
        console.log("Unable to fetch a response: ", err);
        res.json({ error: err });
      } else {
        res.json(response);
      }
    });
});

module.exports = router;
