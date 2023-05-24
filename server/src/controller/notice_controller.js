const _ = require("lodash")
const { User } = require("../model")

module.exports = {
  async getNoticesInfo(notices) {
    const noticesObj = _.cloneDeep(notices)
    for (let notice of noticesObj) {
      const creator = await notice.getUser()
      notice.dataValues.userName = creator.name
    }
    return noticesObj
  }
}
