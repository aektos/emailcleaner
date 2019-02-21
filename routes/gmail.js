const express = require('express');
const router = express.Router();
const fs = require('fs');

const googleServices = require('../services/googleServices');
const gmailServices = require('../services/gmailServices');
const config = require('../config/config');

/**
 * Generate and redirect to Google URL
 * to authorize the web app
 */
router.get('/authorize', (req, res, next) => {
    if (req.session.token) {
        res.redirect("/gmail/dashboard");
    } else if (process.env.NODE_ENV === 'development' && fs.existsSync(config.TOKEN_PATH)) {
        let token = fs.readFileSync(config.TOKEN_PATH, 'UTF-8');
        req.session.token = JSON.parse(token);
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
                req.session.token = token;
                if (process.env.NODE_ENV === 'development') {
                    fs.writeFileSync(config.TOKEN_PATH, JSON.stringify(token), 'UTF-8');
                }
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
    if (!req.session.token) {
        res.redirect("/gmail/authorize");
    } else {
        googleServices.oAuth2Client.setCredentials(req.session.token);
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
