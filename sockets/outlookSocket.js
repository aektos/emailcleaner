const OutlookServicesClass = require('../services/outlookServices');
const OutlookSorterServicesClass = require('../services/outlookSorterServices');

module.exports = (socket) => {
    socket.on('outlook-clean', () => {
        if (socket.handshake.session.token_outlook) {
            let outlookServices = new OutlookServicesClass();
            let outlookSorterServices = new OutlookSorterServicesClass();

            if (socket.handshake.session.token_outlook) {
                let startTime = Date.now();
                outlookServices.getOutlook(socket.handshake.session.token_outlook);
                outlookServices.listMessages(null, 0, socket)
                    .then((messages) => {
                        messages.forEach((message, i) => {
                            outlookSorterServices.indexByEmail(message);
                        });

                        let endTime = Date.now();
                        console.log('Outlook-clean time: ' + parseInt(endTime - startTime) + 'ms ');
                        let emailIndex = outlookSorterServices.getEmailsIndexToArray();
                        socket.emit('cleaned', emailIndex);
                    })
                    .catch((err) => {
                        console.error(err);
                        socket.emit('error', 'Ops, something has gone wrong.');
                        reject(err);
                    })
            } else {
                socket.emit('error', 'Ops, something has gone wrong.');
            }
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });

    socket.on('outlook-delete', (data) => {
        if (socket.handshake.session.token_outlook) {
            let outlookServices = new OutlookServicesClass();

            if (typeof data.messages !== 'undefined') {
                outlookServices.getOutlook(token_outlook);
                outlookServices.trashAllMessages(data.messages, socket)
                    .then(() => {
                        socket.emit('deleted', {
                            id: data.id,
                            nb_deleted: data.messages.length,
                            delete: true
                        });
                        socket.handshake.session.nb_deleted += data.messages.length;
                        socket.handshake.session.save();
                    })
                    .catch((err) => {
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
