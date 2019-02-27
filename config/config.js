const config = {};

if (process.env.NODE_ENV === 'development') {
    /**
     * My secret phrase
     * @type {string}
     */
    config.mySecretPhrase = 'mysecretphrase';
} else {
    /**
     * My secret phrase
     * @type {string}
     */
    config.mySecretPhrase = process.env.mySecretPhrase;
}

/**
 * TOKEN PATH
 * Path to a file containing access token for Google API
 */
config.TOKEN_GMAIL_PATH = '/tmp/token_gmail.json';

/**
 * TOKEN PATH
 * Path to a file containing access token for Google API
 */
config.TOKEN_OUTLOOK_PATH = '/tmp/token_outlook.json';

module.exports = config;