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

module.exports = config;