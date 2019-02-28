const express = require('express');
const router = express.Router();

const MicrosoftServicesClass = require('../services/microsoftServices');
const OutlookServicesClass = require('../services/outlookServices');

let microsoftServices = new MicrosoftServicesClass();
let outlookServices = new OutlookServicesClass();

/**
 * Generate and redirect to Microsoft URL
 * to authorize the web app
 */
router.get('/authorize', (req, res, next) => {
    if (req.session.token_outlook) {
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
                req.session.token_outlook = token;
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
    if (!req.session.token_outlook) {
        res.redirect("/outlook/authorize");
    } else {
        outlookServices.getOutlook(req.session.token_outlook);
        outlookServices.getProfile()
            .then((user) => {
                res.render('dashboard', {user: user});
            })
            .catch((err) => {
                next(err);
            });
    }
});

module.exports = router;
