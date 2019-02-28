var keyFile = null;
if (process.env.NODE_ENV === 'development') {
    keyFile = require('../outlook.oauth2.keys.json');
} else {
    keyFile = JSON.parse(process.env.keyFileMicrosoft);
}

const oauth2 = require('simple-oauth2').create(keyFile.credentials);

/**
 * Class to oAuth2Client MICROSOFT
 */
class MicrosoftServices {
    /**
     * Generate URL to authorize web app
     * and get access token
     *
     * @returns string
     */
    generateAuthUrl() {
        return oauth2.authorizationCode.authorizeURL({
            redirect_uri: keyFile.app.redirect_uri,
            scope: keyFile.app.app_scopes
        });
    }

    /**
     * Get access token from code
     *
     * @returns {promise}
     */
    getTokenFromCode(auth_code) {
        return new Promise((resolve, reject) => {
            oauth2.authorizationCode.getToken({
                    code: auth_code,
                    redirect_uri: keyFile.app.redirect_uri,
                    scope: keyFile.app.app_scopes
                })
                .then((result) => {
                    const token = oauth2.accessToken.create(result);
                    resolve(token.token.access_token);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }
}

module.exports = MicrosoftServices;
