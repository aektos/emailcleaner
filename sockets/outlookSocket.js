const childHelper = require('../helpers/childHelper');

module.exports = (socket) => {
    socket.on('outlook-clean', () => {
        if (socket.handshake.session.token_outlook && socket.handshake.session.child === null) {
            childHelper(socket,
                './scripts/outlook_clean.js',
                [JSON.stringify(socket.handshake.session.token_outlook)],
                (data) => {
                    socket.emit('cleaned', data);
                },
                (data) => {
                    socket.emit('error', 'Ops, something has gone wrong.');
                }
            );
        } else {
            socket.emit('error', 'Ops, something has gone wrong: session lost.');
        }
    });

    socket.on('outlook-delete', (data) => {
        if (socket.handshake.session.token_outlook && socket.handshake.session.child === null) {
            childHelper(socket,
                './scripts/outlook_delete.js',
                [ JSON.stringify(socket.handshake.session.token_outlook), JSON.stringify(data)],
                (data) => {
                    socket.emit('deleted', data);
                    socket.handshake.session.nb_deleted += data.nb_deleted;
                    console.log(data.nb_deleted);
                    console.log(socket.handshake.session.nb_deleted);
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
