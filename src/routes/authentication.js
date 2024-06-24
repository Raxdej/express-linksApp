const express = require('express')
const router = express.Router()

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

// SIGNIN
router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', (req, res, next) => {
  passport.authenticate('local.signin', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('message', 'Incorrect username or password');
      return res.redirect('/signin');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/profile');
    });
  })(req, res, next);
});

// SIGNUP
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));

// PROFILE
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/signin');
  });
});

module.exports = router