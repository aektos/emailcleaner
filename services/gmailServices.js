const {google} = require('googleapis');

const googleServices = require('./googleServices');
const sorterServices = require('./gmailSorterServices');

/**
 * Module to interact with GMAIL API
 */
var gmailServices = {
    gmail: () => {
        return google.gmail({
            version: 'v1',
            auth: googleServices.oAuth2Client
        })
    }
};

/**
 * Max results GMAIL
 * @type {number}
 */
const maxResults = 5000;

/**
 * Get user profile info
 *
 * @returns {Promise}
 */
gmailServices.getProfile = () => {
    return new Promise((resolve, reject) => {
        gmailServices.gmail().users.getProfile({
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
};

/**
 * Lists the messages in the user's account.
 *
 * @param pageToken
 * @returns {Promise}
 */
gmailServices.listMessages = (pageToken) => {
    return new Promise((resolve, reject) => {
        gmailServices.gmail().users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            pageToken: pageToken,
            includeSpamTrash: false
        }).then((res) => {
            let messages = res.data.messages;
            if (messages.length) {
                if (res.data.nextPageToken) {
                    gmailServices.listMessages(res.data.nextPageToken)
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
gmailServices.getAllMessages = (messages) => {
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
                return gmailServices.getMessage(message.id);
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
};

/**
 * Get a message by id
 *
 * @param id An authorized OAuth2 client.
 * @returns {Promise}
 */
gmailServices.getMessage = (id) => {
    return new Promise((resolve, reject) => {
        gmailServices.gmail().users.messages.get({
            id: id,
            userId: 'me',
            format: 'full'
        })
            .then((res) => {
                sorterServices.indexByEmail(res);
                resolve(res.data.snippet);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

/**
 * Move a message by id to trash
 *
 * @param id An authorized OAuth2 client.
 * @returns {Promise}
 */
gmailServices.trashMessage = (id) => {
    return new Promise((resolve, reject) => {
        gmailServices.gmail().users.messages.trash({
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
};


/**
 * Trash all messages from the list 'messages"
 *
 * @param messages
 * @returns {Promise}
 */
gmailServices.trashAllMessages = (messages) => {
    return new Promise((resolve, reject) => {
        if (!messages.length) {
            resolve([]);
        }
        let allPromises = new Promise((resolve, reject) => {
            resolve(null);
        });
        messages.forEach((messageId) => {
            allPromises = allPromises.then(() => {
                return gmailServices.trashMessage(messageId);
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
};

module.exports = gmailServices;
