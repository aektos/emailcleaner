const graph = require('@microsoft/microsoft-graph-client');
const url = require('url');
const querystring = require('querystring');

const sorterServices = require('./outlookSorterServices');

/**
 * Module to interact with OUTLOOK API
 */
var outlookServices = {
    outlook: (accessToken) => {
        return graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });
    }
};

/**
 * Get the connected user info
 *
 * @param accessToken
 * @returns {Promise}
 */
outlookServices.getProfile = (accessToken) => {
    return new Promise((resolve, reject) => {
        let query = outlookServices.outlook(accessToken)
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
};

/**
 * Get a message by id
 *
 * @param accessToken
 * @param pageToken
 * @returns {Promise}
 */
outlookServices.listMessages = (accessToken, pageToken) => {
    return new Promise((resolve, reject) => {
        let query = outlookServices.outlook(accessToken)
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
                    sorterServices.indexByEmail(message);
                });
                if (result['@odata.nextLink']) {
                    outlookServices
                        .listMessages(accessToken, result['@odata.nextLink'])
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
};

/**
 * Delete a message by id
 *
 * @param accessToken
 * @param messageId
 * @returns {Promise}
 */
outlookServices.trashMessage = (accessToken, messageId) => {
    return new Promise((resolve, reject) => {
        let query = outlookServices.outlook(accessToken)
            .api('/me/messages/' + messageId + "/move");
        query.post({"destinationId": "deleteditems"})
            .then(() => {
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
 * @param accessToken
 * @param messages
 * @returns {Promise}
 */
outlookServices.trashAllMessages = (accessToken, messages) => {
    return new Promise((resolve, reject) => {
        if (!messages.length) {
            resolve([]);
        }
        var allPromises = new Promise((resolve, reject) => {
            resolve(null);
        });
        messages.forEach((messageId) => {
            allPromises = allPromises.then(() => {
                return outlookServices.trashMessage(accessToken, messageId);
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

module.exports = outlookServices;
