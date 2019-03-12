const GoogleServicesClass = require('../services/googleServices');
const GmailServicesClass = require('../services/gmailServices');
const GmailSorterServicesClass = require('../services/gmailSorterServices');

module.exports = (socket) => {
    socket.on('gmail-clean', () => {
        if (socket.handshake.session.token_gmail) {
            let googleServices = new GoogleServicesClass();
            let gmailServices = new GmailServicesClass(googleServices);
            let gmailSorterServices = new GmailSorterServicesClass();

            if (socket.handshake.session.token_gmail) {
                googleServices.oAuth2Client.setCredentials(socket.handshake.session.token_gmail);
                let startTime = Date.now();
                gmailServices.listMessages(null, 0, socket)
                    .then((messages) => {
                        return gmailServices.getAllMessages(messages, socket);
                    })
                    .then((messages) => {
                        messages.shift();
                        messages.forEach((message) => {
                            gmailSorterServices.indexByEmail(message);
                        });
                        let endTime = Date.now();
                        console.log('Gmail-clean time: ' + parseInt(endTime - startTime) + 'ms ');
                        let emailIndex = gmailSorterServices.getEmailsIndexToArray();
                        socket.emit('cleaned', emailIndex);
                    })
                    .catch((err) => {
                        console.error(err);
                        socket.emit('error', 'Ops, something has gone wrong.');
                        reject(err);
                    });
            } else {
                socket.emit('error', 'Ops, something has gone wrong.');
            }
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });

    socket.on('gmail-delete', (data) => {
        if (socket.handshake.session.token_gmail) {
            let googleServices = new GoogleServicesClass();
            let gmailServices = new GmailServicesClass(googleServices);

            if (socket.handshake.session.token_gmail && typeof data.messages !== 'undefined') {
                googleServices.oAuth2Client.setCredentials(socket.handshake.session.token_gmail);
                gmailServices.trashAllMessages(data.messages, socket)
                    .then(() => {
                        socket.emit('deleted', {
                            id: data.id,
                            nb_deleted: data.messages.length,
                            delete: true
                        });
                        socket.handshake.session.nb_deleted += data.nb_deleted;
                        socket.handshake.session.save();
                    })
                    .catch((err) => {
                        console.error(err);
                        socket.emit('error', 'Ops, something has gone wrong.');
                        reject(err);
                    });
            } else {
                socket.emit('error', 'Ops, something has gone wrong.');
            }
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });
};
