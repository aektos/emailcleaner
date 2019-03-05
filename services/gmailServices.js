const {google} = require('googleapis');

/**
 * Number of messages per page
 *
 * @type {number}
 */
const NB_MSG_PER_PAGE_GMAIL = 50;

/**
 * Total number of messages to list
 *
 * @type {number}
 */
const TOTAL_LIST_MSG_GMAIL = 100;

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
     * @param total
     * @returns {Promise}
     */
    listMessages(pageToken, total = 0) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.list({
                userId: 'me',
                maxResults: NB_MSG_PER_PAGE_GMAIL,
                pageToken: pageToken,
                includeSpamTrash: false
            }).then((res) => {
                let messages = typeof res.data.messages !== 'undefined' && typeof res.data.messages !== 'undefined' ? res.data.messages : [];
                if (messages.length) {
                    total += NB_MSG_PER_PAGE_GMAIL;
                    if (res.data.nextPageToken && total + NB_MSG_PER_PAGE_GMAIL <= TOTAL_LIST_MSG_GMAIL) {
                        this.listMessages(res.data.nextPageToken, total)
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
     * Get all the messages in the user's account.
     *
     *@param messages
     * @returns {Promise}
     */
    getSubAllMessages(messages) {
        return new Promise((resolve, reject) => {
            if (!messages.length) {
                resolve([]);
            }
            let allPromises = [];
            messages.forEach((message) => {
                allPromises.push(this.getMessage(message.id));
            });
            Promise.all(allPromises).then((data) => {
                resolve(data);
            }).catch((err) => {
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
