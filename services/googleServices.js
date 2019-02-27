var keyFile = null;
if (process.env.NODE_ENV === 'development') {
    keyFile = require('../gmail.oauth2.keys.json');
} else {
    keyFile = JSON.parse(process.env.keyFileGoogle);
}

const {google} = require('googleapis');

/**
 * Process access keys & redirect uri for Google API
 */
if (keyFile.installed || keyFile.web) {
    keys = keyFile.installed || keyFile.web;
    var redirectUri = keys.redirect_uris[keys.redirect_uris.length - 1];
}

/**
 * Scopes used by the app
 */
const scopes = [
    'https://www.googleapis.com/auth/gmail.settings.basic',
    'https://www.googleapis.com/auth/gmail.modify'
];

/**
 * Class to interact with GMAIL API
 */
class GoogleServices {

    constructor () {

        /**
         * Google oAuth2 client
         */
        this.oAuth2Client = new google.auth.OAuth2(
            keys.client_id,
            keys.client_secret,
            redirectUri
        );
    }

    /**
     * Generate URL to authorize web app
     * and get access token

     * @returns string
     */
    generateAuthUrl() {
        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' ')
        });
    }
}

/**
 * Singleton object definition
 */
const googleServicesObj = new GoogleServices();
Object.freeze(googleServicesObj);

module.exports = googleServicesObj;
