module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.handshake.session.isConnected = true;
        socket.handshake.session.nb_deleted = 0;
        socket.handshake.session.save();

        socket.on('disconnect', () => {
            console.log('socket user disconnected');
            socket.handshake.session.isConnected = false;
            socket.handshake.session.save();
        });

        let gmailSocket = require('./gmailSocket.js')(socket);
        let outlookSocket = require('./outlookSocket.js')(socket);
    });
};