const { Floor } = require("../model")

module.exports = {
  getUsers: async function(floorId,limit,page) {
    const { getUserInfo } = require("./user_controller")
    const { getUsers} =require("./room_controller")
    let users = []
    const floor = await Floor.findOne({ where: { id: floorId } })
    const rooms = await floor.getRooms()
    for (let room of rooms) {
      users=[...users,...(await getUsers(room.id)).users]
      // for (let user of roomUsers) {
      //   users.push(await getUserInfo(user.id))
      // }
    }
    let Users=[...users]
    let count =users.length
    users = users.slice((page - 1) * limit, (page - 1) * limit+limit) ||users.slice((page - 1) * limit, count-(page - 1) * limit)||users;
    return {users,count,Users}
  }
}
