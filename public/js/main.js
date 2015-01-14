$.get('/questions/1', function(data) {
  var question = data.question;
  console.log(question);
  $('.question').text(question.title);
  $('.loading').hide();
  $('.survey').show();
});
