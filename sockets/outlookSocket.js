const outlookServices = require('../services/outlookServices');
const outlookSorterServices = require('../services/outlookSorterServices');

module.exports = (socket) => {
    socket.on('outlook-clean', () => {
        if (socket.handshake.session.token_outlook) {
            var startTime = Date.now();
            outlookServices.getOutlook(socket.handshake.session.token_outlook);
            outlookServices.listMessages()
                .then(() => {
                    var endTime = Date.now();
                    console.log('Outlook-clean time: ' + parseInt(endTime - startTime) + 'ms ');
                    let emailIndex = outlookSorterServices.getEmailsIndexToArray();
                    outlookSorterServices.reset();
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

    socket.on('outlook-delete', (data) => {
        if (socket.handshake.session.token_outlook) {
            outlookServices.getOutlook(socket.handshake.session.token_outlook);
            outlookServices.trashAllMessages(data.messages)
                .then(() => {
                    socket.handshake.session.nb_deleted += data.messages.length;
                    socket.handshake.session.save();
                    console.log('Outlook-delete msg.length: ' + data.messages.length + ' ');
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
