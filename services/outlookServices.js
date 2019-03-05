const graph = require('@microsoft/microsoft-graph-client');
const url = require('url');
const querystring = require('querystring');

/**
 * Number of messages per page
 *
 * @type {number}
 */
const NB_MSG_PER_PAGE_OUTLOOK = 50;

/**
 * Total number of messages to list
 *
 * @type {number}
 */
const TOTAL_LIST_MSG_OUTLOOK = 1000;

/**
 * Class to interact with OUTLOOK API
 */
class OutlookServices {

    constructor() {
        this.outlook = {'client': null};
    }

    /**
     *
     * @param accessToken
     * @returns {Client}
     */
    getOutlook(accessToken) {
        this.outlook['client'] = graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });
    }

    /**
     * Get the connected user info
     *
     * @returns {Promise}
     */
    getProfile() {
        return new Promise((resolve, reject) => {
            let query = this.outlook.client
                .api('/me')
                .select('userPrincipalName');

            query.get()
                .then((result) => {
                    let user = {'email': result.userPrincipalName ? result.userPrincipalName : ''};
                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Get a message by id
     *
     * @param pageToken
     * @param total
     * @returns {Promise}
     */
    listMessages(pageToken, total = 0) {
        return new Promise((resolve, reject) => {
            let query = this.outlook.client
                .api('/me/mailfolders/inbox/messages')
                .top(NB_MSG_PER_PAGE_OUTLOOK)
                .select('subject,from,receivedDateTime,isRead,body')
                .orderby('receivedDateTime DESC');

            if (pageToken) {
                let parsedUrl = url.parse(pageToken);
                let parsedQs = querystring.parse(parsedUrl.query);
                query = query.skip(parsedQs.$skip);
            }
            query.get()
                .then((result) => {
                    let messages = typeof result.value !== 'undefined' ? result.value : [];
                    total += NB_MSG_PER_PAGE_OUTLOOK;
                    if (result['@odata.nextLink'] && total + NB_MSG_PER_PAGE_OUTLOOK <= TOTAL_LIST_MSG_OUTLOOK) {
                        this
                            .listMessages(result['@odata.nextLink'], total)
                            .then((data) => {
                                messages = messages.concat(data);
                                resolve(messages);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    } else {
                        resolve(messages);
                    }
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    /**
     * Delete a message by id
     *
     * @param messageId
     * @returns {Promise}
     */
    trashMessage(messageId) {
        return new Promise((resolve, reject) => {
            let query = this.outlook.client
                .api('/me/messages/' + messageId + "/move");
            query.post({"destinationId": "deleteditems"})
                .then(() => {
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
            var allPromises = new Promise((resolve, reject) => {
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

module.exports = OutlookServices;
