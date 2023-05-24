let { User, Floor, Building, Room } = require("../model")
let _ = require("lodash")

module.exports = {
  /**
   * 获取学生用户的完整信息
   * @param {Number} userId
   */
  async getUserInfo(userId) {
    let user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["password", "deletedAt"] }
    })

    if (!user.roomId) {
      let info = Object.assign(user.dataValues, {
        roomNumber: "-",
        floorId: null,
        floorLayer: "-",
        buildingId: "-",
        buildingName: "-",
        roomType: null,
        term: 0,
        expireDate: "-",
        rent: "-"
      })
      console.log(info)
      return info
    }
    let room = await Room.findOne({ where: { id: user.roomId } })
    let floor = await Floor.findOne({ where: { id: room.floorId } })
    let building = await Building.findOne({ where: { id: floor.buildingId } })

    let rent = "-"
    let expireDate = "-"
    if (user.term) {
      let checkTime = new Date(user.checkTime) // 假设checkTime为当前日期
      let expirationDate = new Date(checkTime.getTime())
      expirationDate.setMonth(expirationDate.getMonth() + user.term)
      expireDate = expirationDate.toLocaleDateString()
      rent = room.rent * user.term
    }
    let info = Object.assign(user.dataValues, {
      roomNumber: room.number,
      floorId: floor.id,
      floorLayer: floor.layer,
      buildingId: building.id,
      buildingName: building.name,
      roomType: room.peopleNum,
      term: user.term || 0,
      expireDate,
      rent
    })
    return info
  },

  /**
   * 获取学生用户们的完整信息
   * @param {Array} users
   */
  async getUsersInfo(users) {
    let cloneUsers = _.cloneDeep(users)

    for (let user of cloneUsers) {
      delete user.dataValues.password
      delete user.dataValues.deletedAt
      if (!user.roomId) {
        Object.assign(user.dataValues, {
          roomNumber: "-",
          floorId: null,
          floorLayer: '-',
          buildingId: "-",
          buildingName: "-",
          roomType: null,
          term: 0,
          expireDate: "-",
          rent: "-"
        })
        continue
      }

      let room = await Room.findOne({ where: { id: user.roomId || 1 } })
      let floor = await Floor.findOne({ where: { id: room.floorId || 1 } })
      let building = await Building.findOne({ where: { id: floor.buildingId } })
      let rent = "-"
      let expireDate = "-"
      if (user.term) {
        let checkTime = new Date(user.checkTime) // 假设checkTime为当前日期
        let expirationDate = new Date(checkTime.getTime())
        expirationDate.setMonth(expirationDate.getMonth() + user.term)
        expireDate = expirationDate.toLocaleDateString()
        rent = room.rent * user.term
      }

      Object.assign(user.dataValues, {
        roomNumber: room.number,
        floorId: floor.id,
        floorLayer: floor.layer,
        buildingId: building.id,
        buildingName: building.name,
        roomType: room.peopleNum,
        term: user.term || 0,
        expireDate,
        rent
      })
    }
    return cloneUsers
  },

  async setUserRoomNull(id) {
    let user = await User.findOne({ where: { id, role: "teacher" } })
    let result = await user.update({
      roomId: null,
      checkTime: null,
      term: null
    })
    return result
  }
}
