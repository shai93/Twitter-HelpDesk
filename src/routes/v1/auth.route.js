const express = require('express');
const passport = require('passport');
const config = require('../../config/config');
const authController = require('../../controllers/auth.controller');

const router = express.Router();
// router.get('/twitter', passport.authenticate('twitter'));


router.get('/connect', authController.connect);

router.get('/saveAccessTokens', authController.saveAccessTokens)

// the callback after twitter has authenticated the user
router.get(
  '/twitter/callback',
  passport.authenticate('twitter',{
    successRedirect: config.clientHomeUrl,
    failureRedirect: "/auth/login/failed"
  })
);

module.exports = router;

