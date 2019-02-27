const express = require('express');
const router = express.Router();
const fs = require('fs');

const googleServices = require('../services/googleServices');
const gmailServices = require('../services/gmailServices');

/**
 * Generate and redirect to Google URL
 * to authorize the web app
 */
router.get('/authorize', (req, res, next) => {
    if (req.session.token_gmail) {
        res.redirect("/gmail/dashboard");
    } else {
        let authorizeUrl = googleServices.generateAuthUrl();
        res.redirect(authorizeUrl);
    }
});

/**
 * Redirected to this route by google
 * to get refresh access token
 */
router.get('/auth', (req, res, next) => {
    if (req.query.code) {
        googleServices.oAuth2Client.getToken(req.query.code,
            (err, token) => {
                if (err) {
                    next(err);
                }
                req.session.token_gmail = token;
                res.redirect("/gmail/dashboard");
            }
        );
    } else {
        res.redirect("/gmail/authorize");
    }
});

/**
 * Main dashboard of the GMAIL cleaning operation
 */
router.get('/dashboard', (req, res, next) => {
    if (!req.session.token_gmail) {
        res.redirect("/gmail/authorize");
    } else {
        googleServices.oAuth2Client.setCredentials(req.session.token_gmail);
        gmailServices.getProfile()
            .then((user) => {
                res.render('dashboard', {
                    user: user
                });
            })
            .catch((err) => {
                next(err);
            });
    }
});

module.exports = router;
