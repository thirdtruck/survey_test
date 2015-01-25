var views;

(function() {

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

      var untitledAnswers = answers.filter(function(answer) {
        var answerTitle = answer.get('title');
        return ! answerTitle || answerTitle.length == 0;
      });

      if (_.isEmpty(answers.without(untitledAnswers))) {
        alert('Please supply at least one answer.');
        return;
      }

      answers.remove(untitledAnswers);

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

var QuestionReportView = Backbone.View.extend({

  /* If this was a dynamic report, I would 
   * create an AnswerReportView. It's static, 
   * however, so I'm rendering everything in 
   * a single pass.
   */
  template: _.template($('#template-response-report').text()),

  answerTemplate: _.template($('#template-response-report-answer').text()),

  initialize: function() {
    var view = this;

    view.$questions = view.$el.find('.questions');

    view.listenTo(view.model, 'sync', function() {
      view.render();
    });
  },

  render: function() {
    var view = this;

    var $questions = view.$questions;

    $questions.empty();

    _(view.model.get('questions')).each(function(question) {
      var $question = $(view.template(question));

      var $answersBody = $question.find('.answers tbody');

      _(question.answers).each(function(answer) {
        var answerHTML = view.answerTemplate(answer);
        $answersBody.append(answerHTML);
      });
      
      $questions.append($question);
    });


    view.$el.show();
  }
});

views = {
  QuestionView: QuestionView,
  AnswerView: AnswerView,
  AnswersView: AnswersView,
  SurveyView: SurveyView,
  LoadingView: LoadingView,
  DoneView: DoneView,
  SubmitView: SubmitView,
  LoginView: LoginView,
  LogoutView: LogoutView,
  AddQuestionView: AddQuestionView,
  AddAnswerView: AddAnswerView,
  QuestionReportView: QuestionReportView,
};

})();
