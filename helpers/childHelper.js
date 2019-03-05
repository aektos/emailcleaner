 const fork = require('child_process').fork;

module.exports = (socket, script, params, stdoutFunc, stderrFunc) => {
    socket.handshake.session.child = fork(script, params);
    socket.emit('processing', true);

    socket.handshake.session.child.on('message', stdoutFunc);

    socket.handshake.session.child.on('error', stderrFunc);

    socket.handshake.session.child.on('close', (code) => {
        if (code !== 0) {
            console.log('process exited with code ' + code);
        }
        socket.handshake.session.child = null;
        socket.handshake.session.save();
    });

    socket.handshake.session.child.on('exit', function (code) {
        if (code !== null && code !== 0) {
            console.log(process.argv);
            console.log('Something bad happened\n');
        }
    });

    socket.handshake.session.save();
};