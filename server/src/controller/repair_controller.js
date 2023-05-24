const _ = require("lodash")
const { User } = require("../model")

module.exports = {
  async getRepairsInfo(repairs) {
    const repairsObj = _.cloneDeep(repairs)
    for (let repair of repairsObj) {
      const creator = await repair.getUser()
      repair.dataValues.userName = creator.name
    }
    return repairsObj
  }
}
