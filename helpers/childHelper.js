const spawn = require('child_process').spawn;

module.exports = (socket, params, stdoutFunc, stderrFunc) => {
    socket.handshake.session.child = spawn('node', params);
    socket.emit('processing', true);

    socket.handshake.session.child.stdout.on('data', stdoutFunc);

    socket.handshake.session.child.stderr.on('data', stderrFunc);

    socket.handshake.session.child.on('close', (code) => {
        if (code !== 0) {
            console.log('process exited with code ' + code);
        }
        socket.handshake.session.child = null;
        socket.handshake.session.save();
    });

    socket.handshake.session.save();
};