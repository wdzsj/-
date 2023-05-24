const { User } = require("../model")

module.exports = {
  async getUsers(roomId, limit = 0, page = 0) {
    const { getUsersInfo } = require("./user_controller")
    let users = []
    let s = 0
    if (limit !== 0) {
      const { count, rows } = await User.findAndCountAll({
        where: { roomId },
        order: [["checkTime", "DESC"]],
        offset: (page - 1) * limit,
        limit: limit * 1
      })
      users = await getUsersInfo(rows)
      s = count
    } else {
      users = await User.findAll({
        where: { roomId },
        order: [["checkTime", "DESC"]]
      })
      users = await getUsersInfo(users)
    }

    return { users, s}
  }
}
