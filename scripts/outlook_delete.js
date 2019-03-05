const OutlookServicesClass = require('../services/outlookServices');

process.on('exit', function (code) {
    if (code !== 0) {
        console.log(process.argv);
        console.log('Something bad happened\n');
    }
});

let token_outlook = typeof process.argv[2] !== 'undefined' ? JSON.parse(process.argv[2]) : process.exit(1);
// You can debug the script by overriden token_outlook with a token value
let data = typeof process.argv[3] !== 'undefined' ? JSON.parse(process.argv[3]) : process.exit(2);

let outlookServices = new OutlookServicesClass();

if (token_outlook && typeof data.messages !== 'undefined') {
    outlookServices.getOutlook(token_outlook);
    outlookServices.trashAllMessages(data.messages)
        .then(() => {
            proccess.send({
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