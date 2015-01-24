var models;

(function() {

var User = Backbone.Model.extend({

  urlRoot: '/users',
  
  defaults: {
    id: null,
    uuid: null,
    anonymous: undefined
  }

});

var Question = Backbone.Model.extend({

  defaults: {
    title: 'Title Missing',
    answers: []
  },

  urlRoot: '/questions',

  parse: function(data, options) {
    var question = this;

    question.answers = new Answers(data.Answers || [], {
      question: question
    });
    
    return Backbone.Model.prototype.parse.apply(this, arguments);
  }

});

var Questions = Backbone.Collection.extend({

  model: Question,

  url: '/questions'

});

var Answer = Backbone.Model.extend({
  
  defaults: {
    title: 'Title Missing'
  }

});

var Answers = Backbone.Collection.extend({
  
  model: Answer,

  initialize: function() {
    var answers = this;

    answers.selected = null;

    answers.on('answer_selected', answers.answerSelected, answers);
  },

  answerSelected: function(answer) {
    var answers = this;

    answers.selected = answer;
  }

});

var Response = Backbone.Model.extend({
  
  urlRoot: '/responses'
  
});

var ResponseReport = Backbone.Model.extend({

});

models = {
  User: User,
  Question: Question,
  Questions: Questions,
  Answer: Answer,
  Answers: Answers,
  Response: Response,
  ResponseReport: ResponseReport,
};

})();
