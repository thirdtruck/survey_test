$(document).ready(function() {

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

var AnswerView = Backbone.View.extend({

  template: _.template($('#template-answer').text()),

  initialize: function() {
    var view = this;

    view.listenTo(view.model, "change", view.render);
  },

  render: function() {
    var view = this;

    view.$el.html(view.template(view.model.attributes));

    view.$el.on('change', function() {
      view.model.trigger('answer_selected', view.model);
      return true;
    });

    return this;
  }

});

var AnswersView = Backbone.View.extend({

  initialize: function() {
    var view = this;
    view.model = view.model || new Answers([]);
  },

  render: function() {
    var view = this;

    view.$el.empty();

    var answerViews = view.model.map(function(answer) {
      var $answer = $('<div class="answer" />');

      var answerView = new AnswerView({
        model: answer
      });

      answerView.render();

      view.$el.append(answerView.el);

      return answerView;
    });

    return view;
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

var QuestionView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$title = view.$el.find('.title');

    view.$answers = view.$el.find('.answers');

    view.listenTo(view.model, "change", view.render);
  },

  render: function() {
    var view = this;

    view.$title.text(view.model.get('title'));

    view.answersView = new AnswersView({
      model: view.model.answers,
      el: view.$answers
    });

    view.answersView.render();
  }
});

var LoadingView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$loading = view.$el.find('.loading');
    view.$survey = view.$el.find('.survey');

    view.listenTo(view.model, "request", function() {
      view.$loading.show();
      view.$survey.hide();
    });

    view.listenTo(view.model, "sync", function() {
      view.$loading.hide();
      view.$survey.show();
    });
  }
});

var Response = Backbone.Model.extend({
  
  urlRoot: '/responses'
  
});

var SubmitView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$el.on('click', function() {
      var selectedAnswer = view.model.answers.selected;

      if (_.isNull(selectedAnswer)) {
        alert('Please select an answer before submitting.');
        return false;
      }

      view.submitResponse(selectedAnswer);

      return true;
    });
  },

  submitResponse: function(answer) {
    var response = new Response({
      AnswerID: answer.get('id')
    });

    response.save({}, {
      success: function() {
        console.log("Submitted successfully!");
      },
      error: function() {
        console.log("Error while submitting:", arguments);
      }
    });
  }

});

var question = new Question({ id: 1 });

var questionView = new QuestionView({
  model: question,
  el: $('.question')
});

var loadingView = new LoadingView({
  model: question,
  el: document
});

var submitView = new SubmitView({
  model: question,
  el: $('.submit')
});

question.fetch();

});

