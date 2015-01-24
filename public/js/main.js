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
      success: function(response) {
        alert('Thank you for answering!');
        view.model.clear({ silent: true });
        view.model.set({ id: 'random' });
        view.model.fetch();
      },
      error: function() {
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
        view.model.set(data.user);
        alert('Login successful!');
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        alert('Unable to log in: ' + errorThrown);
      });
    });

    view.model.on('change', function() {
      if (view.model.get('anonymous') === false) {
        view.$el.hide();
      } else {
        view.$el.show();
      }
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

    view.model.on('change', function() {
      if (view.model.get('anonymous') === false) {
        view.$el.show();
      } else {
        view.$el.hide();
      }
    });
  }

});

var AddQuestionView = Backbone.View.extend({

  initialize: function() {
    var view = this;

    var adminUser = view.model.get('user');

    view.$addAnswers = view.$el.find('.add-answers');

    view.$addQuestion = view.$el.find('.add-question-submit');

    view.$questionTitle = view.$el.find('.question-title');

    var answers = new Answers([], { question: view.model });

    view.model.set({ answers: answers });

    view.listenTo(answers, 'add', function(answer) {
      view.addNewAnswerView(answer);
    });

    view.listenTo(answers, 'remove', function(answer) {
      view.removeNewAnswerView(answer);
    });

    view.listenTo(answers, 'add_new_answer', function(answer) {
      view.addNewAnswer();
    });
    
    view.listenTo(answers, 'remove_new_answer', function(answer, answerView) {
      /* Always leave at least one AddAnswerView. */
      if (answers.length <= 1) {
        return;
      }

      answers.remove(answer);
    });
    
    adminUser.on('change', function() {
      if (adminUser.get('anonymous') === false) {
        view.$el.show();
      } else {
        view.$el.hide();
      }
    });

    view.$questionTitle.on('change', function() {
      view.model.set({ title: view.$questionTitle.val() });
    });

    view.$addQuestion.on('click', function() {
      event.preventDefault();

      var questionTitle = view.$questionTitle.val();

      if (questionTitle === "" || _(question).isUndefined()) {
        alert('Please supply a title for the question.');
        return;
      }

      var answerTitles = answers
                          .invoke('get', 'title')
                          .filter(function(answerTitle) {
                            return answerTitle && answerTitle.length > 0;
                          });

      if (_.isEmpty(answerTitles)) {
        alert('Please supply at least one answer.');
        return;
      }

      view.model.save({}, {
        success: function(question, serverResp, options) {
          alert('New question saved.');
          view.resetQuestion();
        },
        error: function(question, serverResp, options) {
          alert('Unable to save the new question.');
        }
      });
    });

    view.render();

    view.addNewAnswer();
  },

  render: function() {
    var view = this;

    view.$addAnswers.empty();

    view.addAnswerViews = [];

    view.model.get('answers').each(function(answer) {
      view.addNewAnswerView(answer);
    });
    
    return view;
  },

  resetQuestion: function() {
    var view = this;

    view.model.get('answers').reset()

    view.model.unset('id');

    view.$questionTitle.val(''); /* This will trigger a value change. */

    view.render();

    view.addNewAnswer();
  },

  addNewAnswer: function() {
    var view = this;
    var answers = view.model.get('answers');
    
    answers.add({ tempID: 1, title: '' });
  },

  addNewAnswerView: function(answer) {
    var view = this;

    var addAnswerView = new AddAnswerView({
      model: answer
    });

    view.addAnswerViews.push(addAnswerView);

    addAnswerView.render();

    view.$addAnswers.append(addAnswerView.el);
  },

  removeNewAnswerView: function(answer) {
    var view = this;

    var viewsToRemove = _(view.addAnswerViews).where({ model: answer });

    _(viewsToRemove).each(function(viewToRemove) {
      viewToRemove.$el.remove();
    });

    view.addAnswerViews = _(view.addAnswerViews).without(viewsToRemove);
  },

});

var AddAnswerView = Backbone.View.extend({

  template: _.template($('#template-add-answer').text()),

  initialize: function() {
    var view = this;

    view.$el.on('change', '.title', function() {
      var $answerTitle = $(this);
      view.model.set({ title: $answerTitle.val() });
    });

    view.$el.on('click', '.add-new-answer', function() {
      view.model.trigger('add_new_answer', view.model);
    });

    view.$el.on('click', '.remove-new-answer', function() {
      view.model.trigger('remove_new_answer', view.model, view);
    });
  },

  render: function() {
    var view = this;

    view.$el.html(view.template(view.model.attributes));

    return view;
  }

});

var User = Backbone.Model.extend({
  
  defaults: {
    id: null,
    uuid: null,
    anonymous: undefined
  }

});

function initialize() {

  var user = new User();
  var question = new Question({ id: 'random' });
  var draftQuestion = new Question({ user: user });

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
    el: $('.survey .submit')
  });

  var loginView = new LoginView({
    model: user,
    el: $('.login-form')
  });

  var logoutView = new LogoutView({
    model: user,
    el: $('.logout')
  });

  var addQuestionView = new AddQuestionView({
    model: draftQuestion,
    el: $('.add-question')
  });

  /* TODO: Refactor this to use #fetch. */
  $.get('/users/current')
    .done(function(data) {
      if (data) {
        user.set(data);
      } else {
        user.set({ anonymous: true });
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('Error while fetching current user: ', errorThrown);
      user.set({ anonymous: true });
    })
    .always(function() {
      question.fetch();
    });

}

initialize();

});

