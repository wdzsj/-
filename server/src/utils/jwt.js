const jwt = require("jsonwebtoken")
const { sysConfig } = require("../config")

/**
 * @typedef {Object} tokenPayload
 * @property {number} userId
 * @property {number} tokenId
 * @property {string} role
 */

/**
 * 创建 Token 串
 * @param {tokenPayload} payload
 */
function getToken(payload) {
  return jwt.sign(payload, sysConfig.tokenSalt, {
    expiresIn: sysConfig.tokenExp
  })
}

/**
 * 
 * @param {tokenPayload} token
//  */
// 验证token
function getPayload(token) {
  return jwt.verify(token, sysConfig.tokenSalt)
}

module.exports = {
  getToken,
  getPayload
}
