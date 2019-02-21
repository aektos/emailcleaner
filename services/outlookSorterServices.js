const MD5 = require('md5.js');
const cheerio = require('cheerio');

/**
 * Nombre de <td> et </td> à compter
 * pour considérer le message est une newsletter
 */
const NB_TD_NEWSLETTER = 5;

/**
 * Module pour indexer et trier les messages
 */
var outlookoutlookSorterServices = {
    index: {
        'emails': {}
    },

    /**
     * Initialise l'index
     */
    init: () => {
        outlookSorterServices.index = {
            'emails': {}
        };
    },

    /**
     * Enregistre dans l'index des infos
     * sur le message
     *
     * @param message
     * @returns bool
     */
    indexByEmail: (message) => {
        let key;
        if (typeof outlookSorterServices.index['emails'] === "undefined") {
            outlookSorterServices.init();
        }
        key = new MD5().update(message.from.emailAddress.address).digest('hex');
        if (typeof outlookSorterServices.index['emails'][key] === "undefined") {
            outlookSorterServices.index['emails'][key] = {
                'key': key,
                'from': message.from.emailAddress.address,
                'size': 0,
                'messages': []
            }
        }
        outlookSorterServices.index['emails'][key]['size']++;
        outlookSorterServices.index['emails'][key]['isNewsletter'] = outlookSorterServices.index['emails'][key]['isNewsletter'] ? true : outlookSorterServices.isNewsLetterEmail(message);
        outlookSorterServices.index['emails'][key]['link'] = outlookSorterServices.index['emails'][key]['link'] ? outlookSorterServices.index['emails'][key]['links'] : outlookSorterServices.getUnSubscribeLink(message);
        outlookSorterServices.index['emails'][key]['content'] = outlookSorterServices.index['emails'][key]['content'] ? outlookSorterServices.index['emails'][key]['content'] : outlookoutlookSorterServices.getContent(message);
        outlookSorterServices.index['emails'][key]['messages'].push(message.id);
    },

    /**
     * Retourne vrai si le message ressemble
     * à une newsletter
     *
     * @param message
     * @returns bool
     */
    isNewsLetterEmail: (message) => {
        if(typeof message.body.content === "undefined") {
            return false;
        }
        let $ = cheerio.load(message.body.content);
        return $('td').length > NB_TD_NEWSLETTER;
    },

    /**
     * Retourne les liens de désabonnements
     * à une newsletter
     *
     * @param message
     * @returns {*|*|*|jQuery}
     */
    getUnSubscribeLink: (message) => {
        let $ = cheerio.load(message.body.content);
        return $('a:contains("abonnements"), a:contains("alertes"), a:contains("abonner")').attr('href');
    },

    /**
     * Get message HTML content
     *
     * @param message
     * @returns {*}
     */
    getContent: (message) => {
        if (typeof message.body !== 'undefined' && typeof message.body.content !== 'undefined') {
            let $ = cheerio.load(message.body.content);
            return $('body').html();
        } else {
            return '';
        }
    }
};

/**
 * Singleton object definition
 */
outlookoutlookSorterServices.getInstance = function () {
    if (typeof global.outlookSorterServices === "undefined") {
        global.outlookSorterServices = this;
    }
    return global.outlookSorterServices;
};

module.exports = outlookoutlookSorterServices.getInstance();
