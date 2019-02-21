const express = require('express');
const router = express.Router();
const fs = require('fs');

const microsoftServices = require('../services/microsoftServices');
const outlookServices = require('../services/outlookServices');
const config = require('../config/config');

/**
 * Generate and redirect to Microsoft URL
 * to authorize the web app
 */
router.get('/authorize', (req, res, next) => {
    if (req.session.token) {
        res.redirect("/outlook/dashboard");
    } else if (process.env.NODE_ENV === 'development' && fs.existsSync(config.TOKEN_PATH)) {
        let token = fs.readFileSync(config.TOKEN_PATH, 'UTF-8');
        req.session.token = JSON.parse(token);
        res.redirect("/outlook/dashboard");
    } else {
        let authorizeUrl = microsoftServices.generateAuthUrl();
        res.redirect(authorizeUrl);
    }
});

/**
 * Redirected to this route by Microsoft
 * to get refresh access token
 */
router.get('/auth', (req, res, next) => {
    const code = req.query.code;
    if (code) {
        microsoftServices.getTokenFromCode(code)
            .then((token) => {
                req.session.token = token;
                if (process.env.NODE_ENV === 'development') {
                    fs.writeFileSync(config.TOKEN_PATH, JSON.stringify(token), 'UTF-8');
                }
                res.redirect("/outlook/dashboard");
            })
            .catch((err) => {
                next(err);
            });
    } else {
        res.redirect("/outlook/authorize");
    }
});

/**
 * Main dashboard of the OUTLOOK cleaning operation
 */
router.get('/dashboard', (req, res, next) => {
    if (!req.session.token) {
        res.redirect("/outlook/authorize");
    } else {
        outlookServices.getProfile(req.session.token)
            .then((user) => {
                res.render('dashboard', {user: user});
            })
            .catch((err) => {
                next(err);
            });
    }
});

module.exports = router;
