/**
 * @module src/services/token_factory
 */

const Promise = require('bluebird'),
    tokenService = require('./token');

/**
 * @class
 * @param {string} user
 * @param {array} scopes
 * @param {string} key
 */
var TokenFactory = function (user, scopes, key) {
    var token;

    /**
     * @returns {bluebird/Promise}
     */
    function getFreshToken () {
        return tokenService.getToken(user, scopes, key).then(function (fresh) {
            var expiresAt = Date.now() + ((fresh.expires_in - 60) * 1000);
            fresh.expires_at = expiresAt;
            return fresh;
        })
    }

    /**
     * @returns {bluebird/Promise}
     */
    function isTokenValid () {
        if (!token) {
            return Promise.resolve(false);
        }

        return token.then(function (token) {
            var now = Date.now();

            if (!token.expires_at || token.expires_at < now) {
                return false;
            } else {
                return true;
            }
        })
    }

    /**
     * @returns {bluebird/Promise}
     */
    this.getToken = function () {
        return isTokenValid().then(function (valid) {
            if (!valid) {
                token = getFreshToken();
            }

            return token;
        }).then(function (token) {
            return token.access_token;
        });
    }
};

module.exports = TokenFactory;
