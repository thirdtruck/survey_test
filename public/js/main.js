(function() {
'use strict';

var Question = Backbone.Model.extend({

  defaults: {
    title: 'Title Missing',
    answers: []
  },

  urlRoot: '/questions'

});

var Questions = Backbone.Collection.extend({

  model: Question,

  url: '/questions'

});

var QuestionView = Backbone.View.extend({

  initialize: function() {
    var view = this;
    view.listenTo(view.model, "change", view.render);
  },

  render: function() {
    var view = this;
    view.$el.text(this.model.get('title'));
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
