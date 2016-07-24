/**
 * @module src/services/token
 */

const crypto = require('crypto'),
    https = require('https'),
    querystring = require('querystring'),
    Promise = require('bluebird'),
    Utils = require('../utils');

/**
 * @constant
 * @type {string}
 */
const API_HOSTNAME = "www.googleapis.com";

/**
 * @constant
 * @type {string}
 */
const API_PATH_TOKEN = "/oauth2/v4/token";

/**
 * @constant
 * @type {string}
 */
const AUTH_HEADER = { alg: "RS256", typ: "JWT" };

/**
 * @constant
 * @type {string}
 */
const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer";

/**
 * @constant
 * @type {object}
 */
const SCOPES = {
    FILE: "https://www.googleapis.com/auth/drive.file",
    META: "https://www.googleapis.com/auth/drive.metadata"
};

/**
 * @constant
 * @type {string}
 */
const SEPERATOR = '.';

/**
 * @param {string} user
 * @param {array} scopes
 * @returns {string}
 */
function getClaimsSet (user, scopes) {
    const claimsSet = {
        iss: user,
        scope: scopes.join(' '),
        aud: "https://" + API_HOSTNAME + API_PATH_TOKEN,
        exp: Utils.Date.now() + Utils.Date.ONE_HOUR,
        iat: Utils.Date.now()
    };

    return Utils.Encoding.objectToBase64(claimsSet);
}

/**
 * @returns {string}
 */
function getHeader () {
    return Utils.Encoding.objectToBase64(AUTH_HEADER);
}

/**
 * @param {string} user
 * @param {array} scopes
 * @param {string} privateKey
 * @returns {string}
 */
function getJWT (user, scopes, privateKey) {
    const header = getHeader(),
        claimsSet = getClaimsSet(user, scopes),
        signature = getSignature(header, claimsSet, privateKey);

    return header + SEPERATOR + claimsSet + SEPERATOR + signature;
}

/**
 * @param {string} header
 * @param {string} claimsSet
 * @param {string} privateKey
 * @returns {string}
 */
function getSignature (header, claimsSet, privateKey) {
    const signer = crypto.createSign("RSA-SHA256");

    signer.write(header + SEPERATOR + claimsSet);
    signer.end();

    return Utils.Encoding.bufferToBase64(signer.sign(privateKey));
}

/**
 * @param {string} user
 * @param {array} scopes
 * @param {string} privateKey
 * @returns {bluebird/Promise}
 */
function getToken (user, scopes, privateKey) {
    const jwt = getJWT(user, scopes, privateKey);
    return new Promise(function (resolve, reject) {
        const req = https.request({
            hostname: API_HOSTNAME,
            path: API_PATH_TOKEN,
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            }
        }, function (res) {
            var data = "";

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                try {
                    var parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', function (err) {
            reject(err);
        });

        req.write(querystring.stringify({
            "grant_type": GRANT_TYPE,
            "assertion": jwt
        }));

        req.end();
    });
}

module.exports = {
    SCOPES: SCOPES,
    getToken: getToken
};
