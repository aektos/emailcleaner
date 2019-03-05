
module.exports = (socket) => {
    if (socket.handshake.session.child !== null) {
        socket.handshake.session.child.kill('SIGTERM');
        socket.emit('killed', true);
    }
};