const {google} = require('googleapis');

/**
 * Max results GMAIL
 * @type {number}
 */
const maxResults = 5000;

/**
 * Class to interact with GMAIL API
 */
class GmailServices {

    constructor(googleServices) {

        this.gmail = google.gmail({
            version: 'v1',
            auth: googleServices.oAuth2Client
        })
    }

    /**
     * Get user profile info
     *
     * @returns {Promise}
     */
    getProfile() {
        return new Promise((resolve, reject) => {
            this.gmail.users.getProfile({
                userId: 'me',
            })
                .then((result) => {
                    let user = {'email': result.data.emailAddress ? result.data.emailAddress : ''};
                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Lists the messages in the user's account.
     *
     * @param pageToken
     * @returns {Promise}
     */
    listMessages(pageToken) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.list({
                userId: 'me',
                maxResults: maxResults,
                pageToken: pageToken,
                includeSpamTrash: false
            }).then((res) => {
                let messages = res.data.messages;
                if (messages.length) {
                    if (res.data.nextPageToken) {
                        this.listMessages(res.data.nextPageToken)
                            .then((res) => {
                                messages = messages.concat(res);
                                resolve(messages);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    } else {
                        resolve(messages);
                    }
                } else {
                    reject('No messages found');
                }
            }).catch((err) => {
                reject(err);
            });
        });
    };

    /**
     * Get all the messages in the user's account.
     *
     * @param messages
     * @returns {Promise}
     */
    getAllMessages(messages) {
        return new Promise((resolve, reject) => {
            if (!messages.length) {
                resolve([]);
            }
            let allPromises = new Promise((resolve, reject) => {
                resolve(null);
            });
            let data = [];
            if (process.env.NODE_ENV === 'development') {
                messages = messages.slice(0, 30);
            }
            // console.log('total: ' + messages.length);
            messages.forEach((message) => {
                allPromises = allPromises.then((msg) => {
                    data.push(msg);
                    return this.getMessage(message.id);
                });
            });

            allPromises
                .then(() => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Get a message by id
     *
     * @param id An authorized OAuth2 client.
     * @returns {Promise}
     */
    getMessage(id) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.get({
                id: id,
                userId: 'me',
                format: 'full'
            })
                .then((res) => {
                    // gmailSorterServices.indexByEmail(res);
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    /**
     * Move a message by id to trash
     *
     * @param id An authorized OAuth2 client.
     * @returns {Promise}
     */
    trashMessage(id) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.trash({
                id: id,
                userId: 'me',
            })
                .then((res) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    /**
     * Trash all messages from the list 'messages"
     *
     * @param messages
     * @returns {Promise}
     */
    trashAllMessages(messages) {
        return new Promise((resolve, reject) => {
            if (!messages.length) {
                resolve([]);
            }
            let allPromises = new Promise((resolve, reject) => {
                resolve(null);
            });
            messages.forEach((messageId) => {
                allPromises = allPromises.then(() => {
                    return this.trashMessage(messageId);
                });
            });

            allPromises
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

module.exports = GmailServices;
