
module.exports = (socket) => {
    if (socket.handshake.session.child !== null) {
        process.on('SIGTERM', () => {
            console.log('Got SIGTERM signal.');
        });
        process.kill(socket.handshake.session.child.pid);
        socket.emit('killed', true);
    }
};