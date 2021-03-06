const {google} = require('googleapis');

/**
 * Number of messages per page
 *
 * @type {number}
 */
const NB_MSG_PER_PAGE_GMAIL = 20;

/**
 * Total number of messages to list
 *
 * @type {number}
 */
const TOTAL_LIST_MSG_GMAIL = 500;

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
     * @param socket
     * @returns {Promise}
     */
    listMessages(pageToken, total = 0, socket) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.list({
                userId: 'me',
                maxResults: NB_MSG_PER_PAGE_GMAIL,
                pageToken: pageToken,
                includeSpamTrash: false
            }).then((res) => {
                if (!socket.handshake.session.isConnected) {
                    throw 'user disconnected';
                }
                let messages = typeof res.data.messages !== 'undefined' && typeof res.data.messages !== 'undefined' ? res.data.messages : [];
                if (messages.length) {
                    total += NB_MSG_PER_PAGE_GMAIL;
                    if (res.data.nextPageToken && total <= TOTAL_LIST_MSG_GMAIL) {
                        this.listMessages(res.data.nextPageToken, total, socket)
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
     * @param socket
     * @returns {Promise}
     */
    getAllMessages(messages, socket) {
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
                    if (!socket.handshake.session.isConnected) {
                        throw 'user disconnected';
                    }
                    data.push(msg);
                    return this.getMessage(message.id, socket);
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
     * @param id
     * @param socket
     * @returns {Promise}
     */
    getMessage(id, socket) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.get({
                id: id,
                userId: 'me',
                format: 'full'
            })
                .then((res) => {
                    if (!socket.handshake.session.isConnected) {
                        throw 'user disconnected';
                    }
                    resolve(res);
                })
                .catch((err) => {
                    console.log(err);
                    // reject(err); // don't reject to not block the loop in getAllMessages
                })
        });
    }

    /**
     * Move a message by id to trash
     *
     * @param id
     * @param socket
     * @returns {Promise}
     */
    trashMessage(id, socket) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.trash({
                id: id,
                userId: 'me',
            })
                .then((res) => {
                    if (!socket.handshake.session.isConnected) {
                        throw 'user disconnected';
                    }
                    resolve(true);
                })
                .catch((err) => {
                    console.log(err);
                    // reject(err); // don't reject to not block the loop in trashAllMessages
                })
        });
    }

    /**
     * Trash all messages from the list 'messages"
     *
     * @param messages
     * @param socket
     * @returns {Promise}
     */
    trashAllMessages(messages, socket) {
        return new Promise((resolve, reject) => {
            if (!messages.length) {
                resolve([]);
            }
            let allPromises = new Promise((resolve, reject) => {
                resolve(null);
            });
            messages.forEach((messageId) => {
                allPromises = allPromises.then(() => {
                    return this.trashMessage(messageId, socket);
                });
            });

            allPromises
                .then(() => {
                    if (!socket.handshake.session.isConnected) {
                        throw 'user disconnected';
                    }
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

module.exports = GmailServices;
