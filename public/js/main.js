$(document).ready(function() {

_.extend(window, models);
_.extend(window, views);

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

