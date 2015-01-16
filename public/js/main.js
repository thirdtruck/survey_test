$(document).ready(function() {

var Answer = Backbone.Model.extend({
  
  defaults: {
    title: 'Title Missing'
  }

});

var Answers = Backbone.Collection.extend({
  
  model: Answer

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

var question = new Question({ id: 1 });

var questionView = new QuestionView({
  model: question,
  el: $('.question')
});

var loadingView = new LoadingView({
  model: question,
  el: document
});

question.fetch();

});

