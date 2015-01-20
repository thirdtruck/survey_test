var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

function setupPassportAuthentication(models) {
  passport.use('local-login', new LocalStrategy({
      usernameField: 'login',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, login, password, done) {
      console.log('Starting login check');
      models.User.findOne({ where: { login: login } })
        .complete(function(err, user) {
          console.log('Comparing password');
          if (!!err) {
            console.log('Error', err);
            return done(err);
          }

          if (!user) {
            console.log('User not found');
            return done(null, false);
          }

          if (!user.validPassword(password)) {
            console.log('Invalid password');
            return done(null, false);
          }

          console.log('Valid login!');
          return (null, user);
        });
     })
  );

  return passport;
}

module.exports = {
  setupPassportAuthentication: setupPassportAuthentication
};
