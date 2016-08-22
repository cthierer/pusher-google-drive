/**
 * @module src/services/sheets
 */

const https = require('https'),
  Promise = require('bluebird');

/**
 * @constant
 * @type {string}
 */
const API_HOSTNAME = "sheets.googleapis.com"

/**
 * @constant
 * @type {string}
 */
const API_PATH_SHEETS = "/v4/spreadsheets"

/**
 * @param {string} start
 * @param {string} end
 * @param {string} sheet (optional)
 * @returns {string}
 */
function getRange (start, end, sheet) {
  var range = ''
  if (sheet) {
    range += `${sheet}!`
  }
  return range + `${start}:${end}`
}

/**
 * @param {string} spreadsheetID
 * @param {string} start
 * @param {string} end
 * @param {string} token
 * @returns {Promise}
 */
function getValues (spreadsheetID, start, end, token, options) {
  const range = getRange(start, end)
  const path = `${API_PATH_SHEETS}/${encodeURIComponent(spreadsheetID)}/values/${encodeURIComponent(range)}`

  options = Object.assign({
    filter: () => true,
    format: (data) => data
  }, options || {})

  return new Promise((resolve, reject) => {
    https.request({
      hostname: API_HOSTNAME,
      path: path,
      method: "GET",
      headers: {
        "authorization": `Bearer ${token}`
      }
    }, (res) => {
      var data = ""

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          var parsed = JSON.parse(data)
          var result = Object.assign({ data: [] }, parsed)
          if (parsed.values) {
            parsed.values.forEach((value, idx, arr) => {
              if (options.filter(value, idx, arr)) {
                result.data.push(options.format(value, idx, arr))
              }
            })
          }
          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', (err) => {
      reject(err)
    }).end()
  })
}

module.exports = {
  getValues: getValues
}
