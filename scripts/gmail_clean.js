const GoogleServicesClass = require('../services/googleServices');
const GmailServicesClass = require('../services/gmailServices');
const GmailSorterServicesClass = require('../services/gmailSorterServices');

process.on('exit', function (code) {
    if (code !== 0) {
        console.log(process.argv);
        console.log('Something bad happened\n');
    }
});

let token_gmail = typeof process.argv[2] !== 'undefined' ? JSON.parse(process.argv[2]) : process.exit(1);
// You can debug the script by overriden token_gmail with a token value

let googleServices = new GoogleServicesClass();
let gmailServices = new GmailServicesClass(googleServices);
let gmailSorterServices = new GmailSorterServicesClass();

if (token_gmail) {
    googleServices.oAuth2Client.setCredentials(token_gmail);
    // var startTime = Date.now();
    gmailServices.listMessages(null)
        .then((messages) => {
            return gmailServices.getAllMessages(messages);
        })
        .then((messages) => {
            messages.shift();
            messages.forEach((message) => {
                gmailSorterServices.indexByEmail(message);
            });
            // var endTime = Date.now();
            // console.log('Gmail-clean time: ' + parseInt(endTime - startTime) + 'ms ');
            let emailIndex = gmailSorterServices.getEmailsIndexToArray();
            process.send(emailIndex);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(2);
        });
} else {
    process.exit(3);
}