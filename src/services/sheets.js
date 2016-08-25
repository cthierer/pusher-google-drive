/**
 * @module src/services/sheets
 */

const https = require('https')
const http = require('http')
const Promise = require('bluebird')

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
 * @param {ServerResponse} res
 * @returns {Promise}
 */
function processResponse (res) {
  return new Promise((resolve, reject) => {
    var data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data)
        if (res.statusCode < 300) {
          // successful
          resolve(parsed)
        } else {
          // failed
          const error = parsed.error
          reject(new Error(`${error.status} [${error.code}]: ${error.message}`))
        }
      } catch (e) {
        if (res.statusCode < 300) {
          reject(e)
        } else {
          reject(new Error(`${http.STATUS_CODES[res.statusCode]} [${res.statusCode}]`))
        }
      }
    })
  })
}

/**
 * @param {string} spreadsheetID
 * @param {string} sheet
 * @param {array} values
 * @param {string} token
 * @returns {Promise}
 */
function appendValues (spreadsheetID, sheet, values, token) {
  const range = sheet
  const path = `${API_PATH_SHEETS}/${encodeURIComponent(spreadsheetID)}/values/${encodeURIComponent(range)}:append?insertDataOption=INSERT_ROWS&valueInputOption=USER_ENTERED`

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOSTNAME,
      path: path,
      method: "POST",
      headers: {
        "authorization": `Bearer ${token}`
      }
    }, (res) => { resolve(processResponse(res)) })

    req.on('error', reject)
    req.write(JSON.stringify({ values }))
    req.end()
  })
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
      const result = processResponse(res).then((data) => {
        if (data.values) {
          data.data = data.values.reduce((prev, val, idx, arr) => {
            if (options.filter(val, idx, arr)) {
              return prev.concat(options.format(val, idx, arr))
            }
            return prev
          }, [])
        } else {
          data.data = []
        }
        return data
      })
      resolve(result)
    }).on('error', (err) => {
      reject(err)
    }).end()
  })
}

module.exports = {
  appendValues,
  getValues
}
