/**
 * @module src/utils/date
 */

/**
 * @constant
 * @type {integer}
 */
const ONE_HOUR = 60 * 60;

/**
 * @returns {integer}
 */
function now () {
    return (new Date()).getTime() / 1000;
}

module.exports = {
    ONE_HOUR: ONE_HOUR,
    now: now
};
