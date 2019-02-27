const googleServices = require('../services/googleServices');
const gmailServices = require('../services/gmailServices');
const gmailSorterServices = require('../services/gmailSorterServices');

module.exports = (socket) => {
    socket.on('gmail-clean', () => {
        if (socket.handshake.session.token_gmail) {
            googleServices.oAuth2Client.setCredentials(socket.handshake.session.token_gmail);
            var startTime = Date.now();
            gmailServices.listMessages(null)
                .then((messages) => {
                    return gmailServices.getAllMessages(messages);
                })
                .then(() => {
                    var endTime = Date.now();
                    console.log('Gmail-clean time: ' + parseInt(endTime - startTime) + 'ms ');
                    let emailIndex = gmailSorterServices.getEmailsIndexToArray();
                    socket.emit('cleaned', emailIndex);
                })
                .catch((err) => {
                    socket.emit('error', err);
                    reject(err);
                })
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });

    socket.on('gmail-delete', (data) => {
        if (socket.handshake.session.token_gmail) {
            googleServices.oAuth2Client.setCredentials(socket.handshake.session.token_gmail);
            gmailServices.trashAllMessages(data.messages)
                .then(() => {
                    socket.handshake.session.nb_deleted += data.messages.length;
                    socket.handshake.session.save();
                    console.log('Gmail-delete msg.length: ' + data.messages.length + ' ');
                    socket.emit('deleted', {
                        id: data.id,
                        nb_deleted: data.messages.length,
                        delete: true
                    });
                })
                .catch((err) => {
                    socket.emit('error', err);
                    reject(err);
                });
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });
};
