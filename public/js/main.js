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

    view.listenTo(view.model, 'change', view.render);
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

    view.listenTo(view.model, 'change', view.render);
  },

  render: function() {
    var view = this;

    /* TODO: Find a more "natural" way of 
     * indicating that there are no questions 
     * left.
     */
    var titleText;

    if (view.model.get('noQuestionsLeft')) {
      view.model.trigger('noQuestionsLeft');

      return;
    }

    titleText = view.model.get('title');

    view.$title.text(titleText);

    view.answersView = new AnswersView({
      model: view.model.answers,
      el: view.$answers
    });

    view.answersView.render();
  }
});

var SurveyView = Backbone.View.extend({
  
  initialize: function() {
    var view = this;

    view.$survey = view.$el.find('.survey');

    view.listenTo(view.model, 'request', function() {
      view.$survey.hide();
    });

    view.listenTo(view.model, 'sync', function() {
      if (view.model.get('noQuestionsLeft') !== true) {
        view.$survey.show();
      }
    });

    view.listenTo(view.model, 'noQuestionsLeft', function() {
      view.$survey.hide();
    });
  }

});

var LoadingView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$loading = view.$el.find('.loading');

    view.listenTo(view.model, 'request', function() {
      view.$loading.show();
    });

    view.listenTo(view.model, 'sync', function() {
      view.$loading.hide();
    });
  }

});

var DoneView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$done = view.$el.find('.done');

    view.listenTo(view.model, 'noQuestionsLeft', function() {
      view.$done.show();
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
    var view = this;
    
    var response = new Response({
      AnswerID: answer.get('id')
    });

    response.save({}, {
      done: function(response) {
        alert('Thank you for answering!');
        view.model.clear({ silent: true });
        view.model.set({ id: 'random' });
        view.model.fetch();
      },
      fail: function() {
        alert('Uable to save your response. Sorry!');
      }
    });
  }

});

var LoginView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$login = view.$el.find('.login');
    view.$username = view.$el.find('.username');
    view.$password = view.$el.find('.password');

    /* TODO: More secure login. */
    view.$login.on('click', function(event) {
      event.preventDefault();

      var username = view.$username.val();
      var password = view.$password.val();
      
      $.post('/users/login', {
        login: username,
        password: password
      })
      .done(function(data) {
        alert('Login successful!');
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        alert('Unable to log in: ' + errorThrown);
      });
    });
  }

});

var LogoutView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    view.$el.on('click', function(event) {
      event.preventDefault();

      $.post('/users/logout')
        .always(function() {
          window.location = '/';
        });
    });
  }

});

var question = new Question({ id: 'random' });

var questionView = new QuestionView({
  model: question,
  el: $('.question')
});

var surveyView = new SurveyView({
  model: question,
  el: document
});

var loadingView = new LoadingView({
  model: question,
  el: document
});

var doneView = new DoneView({
  model: question,
  el: document
});

var submitView = new SubmitView({
  model: question,
  el: $('.submit')
});

var LoginView = new LoginView({
  el: $('.login-form')
});

var LogoutView = new LogoutView({
  el: $('.logout')
});

question.fetch();

});

