const killHelper = require('../helpers/killHelper');

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.handshake.session.nb_deleted = 0;
        socket.handshake.session.child = null;
        socket.handshake.session.save();

        socket.on('disconnect', () => {
            killHelper(socket);
        });

        socket.on('kill', () => {
            killHelper(socket);
        });

        let gmailSocket = require('./gmailSocket.js')(socket);
        let outlookSocket = require('./outlookSocket.js')(socket);
    });
};