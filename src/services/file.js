/**
 * @module src/services/file
 */

const https = require('https'),
    Promise = require('bluebird'),
    uuid = require('uuid'),
    Helpers = require('./helpers');

 /**
  * @constant
  * @type {string}
  */
 const API_HOSTNAME = "www.googleapis.com";

/**
 * @constant
 * @type {string}
 */
const API_PATH_FILES = "/upload/drive/v3/files";

/**
 * @returns {string}
 */
function getBoundaryStr () {
    return uuid.v4().replace(/-/g, '_');
}

/**
 * @param {Stream} fileStream
 * @param {string} mime
 * @param {object} properties
 * @param {string} token
 * @returns {bluebird/Promise}
 */
function upload (fileStream, mime, properties, token) {
    const boundary = getBoundaryStr();
    return new Promise(function (resolve, reject) {
        var stream;
        const req = https.request({
            hostname: API_HOSTNAME,
            path: API_PATH_FILES,
            method: "POST",
            headers: {
                "content-type": "multipart/related; boundary=" + boundary,
                "authorization": "Bearer " + token
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
                    console.log('data', data);
                    reject(e);
                }
            });
        });

        req.on('error', function (err) {
            reject(err);
        });

        stream = new Helpers.MultiStream(req, boundary);

        Promise.all([
            stream.writeObject(properties),
            stream.streamFile(fileStream, mime)
        ]).then(function () {
            stream.end();
        });
    });
}

module.exports = {
    upload: upload
};
