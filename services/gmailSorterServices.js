const MD5 = require('md5.js')
const cheerio = require('cheerio')

/**
 * Nombre de <td> et </td> à compter
 * pour considérer le message est une newsletter
 */
const NB_TD_NEWSLETTER = 5;

/**
 * Module pour indexer et trier les messages
 */
var gmailSorterServices = {
    index: {
        'emails': {}
    },

    /**
     * Initialise l'index
     */
    init: () => {
        gmailSorterServices.index = {
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
        var key = null;
        var htmlBody = "";
        if (typeof gmailSorterServices.index['emails'] === "undefined") {
            gmailSorterServices.init();
        }
        message.data.payload.headers.forEach((header, i) => {
            key = new MD5().update(header.value).digest('hex');
            if (header.name === "From") {
                if (typeof gmailSorterServices.index['emails'][key] === "undefined") {
                    gmailSorterServices.index['emails'][key] = {
                        'key': key,
                        'from': header.value.replace(/<[^>]*>/,''),
                        'size': 0,
                        'messages': []
                    }
                }
                let htmlBody = gmailSorterServices.getHtmlBodyEmail(message);

                gmailSorterServices.index['emails'][key]['size']++;
                gmailSorterServices.index['emails'][key]['isNewsletter'] = gmailSorterServices.index['emails'][key]['isNewsletter'] ? true : gmailSorterServices.isNewsLetterEmail(htmlBody);
                gmailSorterServices.index['emails'][key]['link'] = gmailSorterServices.index['emails'][key]['link'] ? gmailSorterServices.index['emails'][key]['links'] : gmailSorterServices.getUnSubscribeLink(htmlBody);
                gmailSorterServices.index['emails'][key]['content'] = gmailSorterServices.index['emails'][key]['content'] ? gmailSorterServices.index['emails'][key]['content'] : gmailSorterServices.getContent(htmlBody);
                gmailSorterServices.index['emails'][key]['messages'].push(message.data.id);
            }
        });
    },

    /**
     * Retourne le corps HTML du message
     *
     * @param message
     * @returns string
     */
    getHtmlBodyEmail: (message) => {
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
    },

    /**
     * Retourne vrai si le message ressemble
     * à une newsletter
     *
     * @param htmlBody
     * @returns bool
     */
    isNewsLetterEmail: (htmlBody) => {
        let $ = cheerio.load(htmlBody);
        return $('td').length > NB_TD_NEWSLETTER
    },

    /**
     * Retourne les liens de désabonnements
     * à une newsletter
     *
     * @param htmlBody
     * @returns {*|*|*|jQuery}
     */
    getUnSubscribeLink: (htmlBody) => {
        let $ = cheerio.load(htmlBody);
        return $('a:contains("abonnements"), a:contains("abonner")').attr('href');
    },

    /**
     * Get message HTML content
     *
     * @param htmlBody
     * @returns {never|string|*|*|void|jQuery}
     */
    getContent: (htmlBody) => {
        let $ = cheerio.load(htmlBody);
        return $('body').html();
    },

    getIndexToArray: () => {
        let arr = [];
        for (let prop in gmailSorterServices.index['emails']) {
            arr.push(gmailSorterServices.index['emails'][prop]);
        }
        return arr;
    },

    /**
     * Sort index by nb emails
     *
     * @param index
     * @returns {*}
     */
    sortIndexByNbEmails: (index) => {
        return index.sort((a,b) => {
            return a.size > b.size ? -1 : 1;
        });
    }
};

/**
 * Singleton object definition
 */
gmailSorterServices.getInstance = function () {
    if (typeof global.gmailSorterServices === "undefined") {
        global.gmailSorterServices = this;
    }
    return global.gmailSorterServices;
};

module.exports = gmailSorterServices.getInstance();
