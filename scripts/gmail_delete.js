const GoogleServicesClass = require('../services/googleServices');
const GmailServicesClass = require('../services/gmailServices');

let token_gmail = typeof process.argv[2] !== 'undefined' ? JSON.parse(process.argv[2]) : process.exit(1);
// You can debug the script by overriden token_gmail with a token value
let data = typeof process.argv[3] !== 'undefined' ? JSON.parse(process.argv[3]) : process.exit(2);

let googleServices = new GoogleServicesClass();
let gmailServices = new GmailServicesClass(googleServices);

if (token_gmail && typeof data.messages !== 'undefined') {
    googleServices.oAuth2Client.setCredentials(token_gmail);
    gmailServices.trashAllMessages(data.messages)
        .then(() => {
            process.send({
                id: data.id,
                nb_deleted: data.messages.length,
                delete: true
            });
        })
        .catch((err) => {
            console.error(err);
            process.exit(3);
        });
} else {
    process.exit(4);
}