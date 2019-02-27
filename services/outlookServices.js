const graph = require('@microsoft/microsoft-graph-client');
const url = require('url');
const querystring = require('querystring');

const outlookSorterServices = require('./outlookSorterServices');

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
     * @returns {Promise}
     */
    listMessages(pageToken) {
        return new Promise((resolve, reject) => {
            let query = this.outlook.client
                .api('/me/mailfolders/inbox/messages')
                .top(20)
                .select('subject,from,receivedDateTime,isRead,body')
                .orderby('receivedDateTime ASC');

            if (pageToken) {
                let parsedUrl = url.parse(pageToken);
                let parsedQs = querystring.parse(parsedUrl.query);
                query = query.skip(parsedQs.$skip);
            }
            query.get()
                .then((result) => {
                    let messages = result.value;
                    messages.forEach((message, i) => {
                        outlookSorterServices.indexByEmail(message);
                    });
                    if (result['@odata.nextLink']) {
                        this
                            .listMessages(result['@odata.nextLink'])
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

/**
 * Singleton object definition
 */
const outlookServicesObj = new OutlookServices();
Object.freeze(outlookServicesObj);

module.exports = outlookServicesObj;
