(function() {
'use strict';

var Answer = Backbone.Model.extend({
  
  defaults: {
    title: 'Title Missing'
  }

});

var Answers = Backbone.Collection.extend({
  
  model: Answer

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

    var answerTitles = view.model.answers.pluck('title');

    view.$answers.html(answerTitles.join('<br/>'));
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

$(document).ready(function() {

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

})();
