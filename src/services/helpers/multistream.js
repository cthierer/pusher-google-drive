/**
 * @module src/services/helpers/multistream
 */

const Promise = require('bluebird');

/**
 * @class
 * @param {Stream} stream
 * @param {string} boundary
 */
var MultiStream = function (stream, boundary) {

    /**
     * Write the boundary separator to the stream.
     */
    function writeBoundary () {
        writeln("\n");
        writeln("--" + boundary);
    }

    /**
     * Write the part header to the stream.
     * @param {string} mimeType
     * @param {string} charset
     */
    function writeHeader (mimeType, charset) {
        const contentType = mimeType + (charset ? "; charset=" + charset : "");
        writeln("Content-Type: " + contentType + "\n");
    }

    /**
     * Write a string, followed by a new line to the stream.
     * @param {string} ln
     */
    function writeln (ln) {
        if (!ln) {
            ln = "";
        }
        write(ln + "\n");
    }

    /**
     * Write a string to the stream.
     * @param {string} str
     */
    function write (str) {
        stream.write(str);
    }

    /**
     * Write an object, formatted as JSON, to the stream.
     * @param {object} obj
     * @returns {bluebird/Promise}
     */
    this.writeObject = function (obj) {
        writeBoundary();
        writeHeader("application/json", "UTF-8");
        writeln(JSON.stringify(obj));
        return Promise.resolve();
    }

    /**
     * Stream an input stream to the stream.
     * @param {Stream} readStream
     * @param {string} mimeType
     * @returns {bluebird/Promise}
     */
    this.streamFile = function (readStream, mimeType) {
        writeBoundary();
        writeHeader(mimeType);
        return new Promise(function (resolve) {
            if (readStream instanceof Buffer) {
                stream.write(readStream);
                writeln();
                resolve();
            } else {
                readStream.on('data', write);
                readStream.on('end', function () {
                    writeln();
                    resolve();
                });
            }
        });
    }

    /**
     * Terminate the stream.
     */
    this.end = function () {
        write("--" + boundary + "--");
        stream.end();
    }
};

module.exports = MultiStream;
