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

/**
 * @class
 * @param {string} user
 * @param {string} key
 */
var GoogleDrivePusher = function (user, key) {
    var tokenFactory = new TokenFactory(user, UPLOAD_SCOPES, key);

    /**
     * @param {Stream|Buffer} file
     * @param {string} mime
     * @param {object} properties
     * @returns {bluebird/Promise}
     */
    this.uploadFile = function (file, mime, properties) {
        return tokenFactory.getToken().then(function (token) {
            return src.Services.File.upload(file, mime, properties, token);
        });
    }
};

module.exports = GoogleDrivePusher;
