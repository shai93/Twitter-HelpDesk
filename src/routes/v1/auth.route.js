const express = require('express');
const passport = require('passport');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
// const authController = require('../../controllers/auth.controller');

const router = express.Router();

// router.post('/register', validate(authValidation.register), authController.register);
// router.post('/login', validate(authValidation.login), authController.login);

// =====================================
// TWITTER ROUTES =====================
// =====================================
// route for twitter authentication and login
router.get('/twitter', passport.authenticate('twitter'));
// the callback after twitter has authenticated the user
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { session: false }),
  function(){
    
  }
);

module.exports = router;

