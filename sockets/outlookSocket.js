const outlookServices = require('../services/outlookServices');
const sorterServices = require('../services/outlookSorterServices');

module.exports = (socket) => {
    socket.on('outlook-clean', () => {
        if (socket.handshake.session.token) {
            sorterServices.init();
            // var startTime = Date.now();
            outlookServices.listMessages(socket.handshake.session.token)
                .then(() => {
                    // var endTime = Date.now();
                    // console.log('Execution time: ' + parseInt(endTime - startTime) + 'ms');
                    let emailIndex = sorterServices.getIndexToArray();
                    outlookSorterServices.sortIndexByNbEmails(emailIndex);
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
        if (socket.handshake.session.token) {
            outlookServices.trashAllMessages(socket.handshake.session.token, data.messages)
                .then(() => {
                    socket.handshake.session.nb_deleted += data.messages.length;
                    socket.handshake.session.save();
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
