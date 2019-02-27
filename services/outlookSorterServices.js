const MD5 = require('md5.js');
const cheerio = require('cheerio');
const BaseSorterServices = require('./BaseSorterServices');

/**
 * Number of <td> et </td> to
 * consider an email as a newsletter
 */
const NB_TD_NEWSLETTER = 5;

/**
 * Class to index and sort emails
 */
class OutlookSorterServices extends BaseSorterServices {

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
     * Build an email index
     *
     * @param message
     * @returns bool
     */
    indexByEmail(message) {
        let key;
        key = new MD5().update(message.from.emailAddress.address).digest('hex');
        if (typeof this.index['emails'][key] === "undefined") {
            this.index['emails'][key] = {
                'key': key,
                'from': message.from.emailAddress.address,
                'size': 0,
                'messages': []
            }
        }
        this.index['emails'][key]['size']++;
        this.index['emails'][key]['isNewsletter'] = this.index['emails'][key]['isNewsletter'] ? true : this.isNewsLetterEmail(message);
        this.index['emails'][key]['link'] = this.index['emails'][key]['link'] ? this.index['emails'][key]['links'] : this.getUnSubscribeLink(message);
        this.index['emails'][key]['content'] = this.index['emails'][key]['content'] ? this.index['emails'][key]['content'] : this.getContent(message);
        this.index['emails'][key]['messages'].push(message.id);
    }

    /**
     * Is an email a newsletter?
     *
     * @param message
     * @returns bool
     */
    isNewsLetterEmail(message) {
        if(typeof message.body.content === "undefined") {
            return false;
        }
        let $ = cheerio.load(message.body.content);
        return $('td').length > NB_TD_NEWSLETTER;
    }

    /**
     * Get unsubscribe newsletter link
     *
     * @param message
     * @returns {*|*|*|jQuery}
     */
    getUnSubscribeLink(message) {
        let $ = cheerio.load(message.body.content);
        return $('a:contains("abonnements"), a:contains("alertes"), a:contains("abonner")').attr('href');
    }

    /**
     * Get message HTML content
     *
     * @param message
     * @returns {*}
     */
    getContent(message) {
        if (typeof message.body !== 'undefined' && typeof message.body.content !== 'undefined') {
            let $ = cheerio.load(message.body.content);
            return $('body').html();
        } else {
            return '';
        }
    }
}

/**
 * Singleton object definition
 */
const outlookSorterServicesObj = new OutlookSorterServices();
Object.freeze(outlookSorterServicesObj);

module.exports = outlookSorterServicesObj;
