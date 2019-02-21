module.exports = (io) => {
    io.on('connection', (socket) => {
        let gmailSocket = require('./gmailSocket.js')(socket);
        let outlookSocket = require('./outlookSocket.js')(socket);
    });
};