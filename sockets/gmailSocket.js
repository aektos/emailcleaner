const childHelper = require('../helpers/childHelper');

module.exports = (socket) => {
    socket.on('gmail-clean', () => {
        if (socket.handshake.session.token_gmail && socket.handshake.session.child === null) {
            childHelper(socket,
                ['./scripts/gmail_clean.js', JSON.stringify(socket.handshake.session.token_gmail)],
                (data) => {
                    socket.emit('cleaned', JSON.parse(data.toString()));
                },
                (data) => {
                    socket.emit('error', 'Ops, something has gone wrong.');
                }
            );
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });

    socket.on('gmail-delete', (data) => {
        if (socket.handshake.session.token_gmail && socket.handshake.session.child === null) {
            childHelper(socket,
                ['./scripts/gmail_delete.js', JSON.stringify(socket.handshake.session.token_gmail), JSON.stringify(data)],
                (data) => {
                    data = JSON.parse(data);
                    socket.emit('deleted', data);
                    socket.handshake.session.nb_deleted += data.nb_deleted;
                    socket.handshake.session.save();
                },
                (data) => {
                    socket.emit('error', 'Ops, something has gone wrong.');
                }
            );
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });
};
