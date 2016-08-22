/**
 * @module src/services
 */

module.exports = {

    /**
     * @see {module:src/services/file}
     */
    File: require('./file'),

    /**
     * @see {module:src/services/sheets}
     */
    Sheets: require('./sheets'),

    /**
     * @see {module:src/services/token}
     */
    Token: require('./token'),

    /**
     * @see {module:src/services/token_factory}
     */
    TokenFactory: require('./token_factory')

};
