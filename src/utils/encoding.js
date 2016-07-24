/**
 * @module src/utils/encoding
 */

const BASE64 = "base64";

/**
 * @param {Buffer} buffer
 * @returns {string}
 */
function bufferToBase64 (buffer) {
    return buffer.toString(BASE64);
}

/**
 * @param {object} obj
 * @returns {string}
 */
function objectToBase64 (obj) {
    return bufferToBase64(new Buffer(JSON.stringify(obj)));
}

module.exports = {
    bufferToBase64: bufferToBase64,
    objectToBase64: objectToBase64
};
