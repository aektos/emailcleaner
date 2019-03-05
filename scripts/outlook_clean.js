const OutlookServicesClass = require('../services/outlookServices');
const OutlookSorterServicesClass = require('../services/outlookSorterServices');

let token_outlook = typeof process.argv[2] !== 'undefined' ? JSON.parse(process.argv[2]) : process.exit(1);
// You can debug the script by overriden token_outlook with a token value

let outlookServices = new OutlookServicesClass();
let outlookSorterServices = new OutlookSorterServicesClass();

if (token_outlook) {
    // var startTime = Date.now();
    outlookServices.getOutlook(token_outlook);
    outlookServices.listMessages()
        .then((messages) => {
            messages.forEach((message, i) => {
                outlookSorterServices.indexByEmail(message);
            });

            // var endTime = Date.now();
            // console.log('Outlook-clean time: ' + parseInt(endTime - startTime) + 'ms ');
            let emailIndex = outlookSorterServices.getEmailsIndexToArray();
            process.send(emailIndex);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(2);
        })
} else {
    process.exit(3);
}