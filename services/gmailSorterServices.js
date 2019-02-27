const MD5 = require('md5.js')
const cheerio = require('cheerio')
const BaseSorterServices = require('./BaseSorterServices');

/**
 * Number of <td> et </td> to
 * consider an email as a newsletter
 */
const NB_TD_NEWSLETTER = 5;

/**
 * Class to index and sort emails
 */
class GmailSorterServices extends BaseSorterServices {

    /**
     * Init index
     */
    constructor() {
        super();
        this.index = {
            'emails': {}
        };
    }

    /**
     * Build emails index
     *
     * @param message
     * @returns bool
     */
    indexByEmail(message) {
        var key = null;
        message.data.payload.headers.forEach((header, i) => {
            key = new MD5().update(header.value).digest('hex');
            if (header.name === "From") {
                if (typeof this.index['emails'][key] === "undefined") {
                    this.index['emails'][key] = {
                        'key': key,
                        'from': header.value.replace(/<[^>]*>/,''),
                        'size': 0,
                        'messages': []
                    }
                }
                let htmlBody = this.getHtmlBodyEmail(message);

                this.index['emails'][key]['size']++;
                this.index['emails'][key]['isNewsletter'] = this.index['emails'][key]['isNewsletter'] ? true : this.isNewsLetterEmail(htmlBody);
                this.index['emails'][key]['link'] = this.index['emails'][key]['link'] ? this.index['emails'][key]['links'] : this.getUnSubscribeLink(htmlBody);
                this.index['emails'][key]['content'] = this.index['emails'][key]['content'] ? this.index['emails'][key]['content'] : this.getContent(htmlBody);
                this.index['emails'][key]['messages'].push(message.data.id);
            }
        });
    }

    /**
     * Get HTML body message
     *
     * @param message
     * @returns string
     */
    getHtmlBodyEmail(message) {
        var htmlBody = "";

        if (typeof message.data !== 'undefined' &&
            typeof message.data.payload !== 'undefined' &&
            typeof message.data.payload.body !== 'undefined' &&
            typeof message.data.payload.body.data !== 'undefined'
        ) {

            htmlBody = message.data.payload.body.data;
        } else if (typeof message.data !== 'undefined' &&
            typeof message.data.payload !== 'undefined' &&
            typeof message.data.payload.parts !== 'undefined'
        ) {
            message.data.payload.parts.forEach((part, i) => {
                if (part.mimeType === "text/html") {
                    htmlBody = part.body.data;
                }
            });
        }

        htmlBody = new Buffer.from(htmlBody, 'base64').toString('utf-8');
        return htmlBody;
    }

    /**
     * Is an email a newsletter?
     *
     * @param htmlBody
     * @returns bool
     */
    isNewsLetterEmail(htmlBody) {
        let $ = cheerio.load(htmlBody);
        return $('td').length > NB_TD_NEWSLETTER
    }

    /**
     * Get unsubscribe newsletter link
     *
     * @param htmlBody
     * @returns {*|*|*|jQuery}
     */
    getUnSubscribeLink(htmlBody) {
        let $ = cheerio.load(htmlBody);
        return $('a:contains("abonnements"), a:contains("abonner")').attr('href');
    }

    /**
     * Get message HTML content
     *
     * @param htmlBody
     * @returns {never|string|*|*|void|jQuery}
     */
    getContent(htmlBody) {
        let $ = cheerio.load(htmlBody);
        return $('body').html();
    }
}

/**
 * Singleton object definition
 */
const gmailSorterServicesObj = new GmailSorterServices();
Object.freeze(gmailSorterServicesObj);

module.exports = gmailSorterServicesObj;
