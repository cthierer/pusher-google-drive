/**
 * @module pusher-google-drive
 */

const src = require('./src'),
    TokenFactory = src.Services.TokenFactory;

/**
 * @constant
 * @type {array}
 */
const UPLOAD_SCOPES = [
    src.Services.Token.SCOPES.FILE,
    src.Services.Token.SCOPES.META
];

const SPREADSHEET_SCOPES = [
    src.Services.Token.SCOPES.SPREADSHEETS
];

/**
 * @class
 * @param {string} user
 * @param {string} key
 */
var GoogleDrivePusher = function (user, key) {
    var fileTokenFactory = new TokenFactory(user, UPLOAD_SCOPES, key);
    var spreadsheetTokenFactory = new TokenFactory(user, SPREADSHEET_SCOPES, key);

    /**
     * @param {Stream|Buffer} file
     * @param {string} mime
     * @param {object} properties
     * @returns {bluebird/Promise}
     */
    this.uploadFile = function (file, mime, properties) {
        return fileTokenFactory.getToken().then(function (token) {
            return src.Services.File.upload(file, mime, properties, token);
        });
    }

    this.getValuesFromSpreadsheet = function (spreadsheet, start, end, options) {
        return spreadsheetTokenFactory.getToken().then(function (token) {
            return src.Services.Sheets.getValues(spreadsheet, start, end, token, options);
        });
    }

    this.addValuesToSpreadsheet = function (spreadsheet, sheet, values) {
        return spreadsheetTokenFactory.getToken().then(function (token) {
            return src.Services.Sheets.appendValues(spreadsheet, sheet, values, token);
        });
    }
};

module.exports = GoogleDrivePusher;
