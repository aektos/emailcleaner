/**
 * Parent class to index and sort emails
 */
class BaseSorterServices {

    /**
     * Init index
     */
    constructor() {
        this.index = {
            'emails': {}
        };
    }

    /**
     * Get emails index to array
     *
     * @returns {Array}
     */
    getEmailsIndexToArray() {
        let arr = [];
        for (let prop in this.index['emails']) {
            arr.push(this.index['emails'][prop]);
        }
        this.sortEmailsIndexByNbEmails(arr);
        return arr;
    }

    /**
     * Sort emails index by nb emails
     *
     * @param index
     * @returns {*}
     */
    sortEmailsIndexByNbEmails(index) {
        return index.sort((a,b) => {
            return a.size > b.size ? -1 : 1;
        });
    }

    /**
     * Reset the email index
     */
    reset() {
        this.index['emails'] = {};
    }
}

module.exports = BaseSorterServices;