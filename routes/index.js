const express = require('express');
const router = express.Router();
const fs = require('fs');

const config = require('../config/config');

/**
 * Home page
 */
router.get('/', (req, res, next) => {
    res.render('index', {});
});

/**
 * Signout by destroying session
 */
router.get('/signout', (req, res, next) => {
    if (typeof req.session.token_gmail === 'undefined' && typeof !req.session.token_outlook === 'undefined') {
        res.redirect('/');
    } else {
        let nb_deleted = req.session.nb_deleted;
        req.session.destroy();

        res.render('summary', {
            nb_deleted: nb_deleted
        });
    }
});

/**
 * FAQ page
 */
router.get('/faq', (req, res, next) => {
    res.render('faq', {});
});

/**
 * CGU page
 */
router.get('/gcu', (req, res, next) => {
    res.render('gcu', {});
});

/**
 * Privacy page
 */
router.get('/privacy', (req, res, next) => {
    res.render('privacy', {});
});

module.exports = router;