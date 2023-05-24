const { Building,User, Floor,Room } = require("../model")

module.exports = {
  getUsers: async function(buildingId,limit,page) {
    const FloorController = require("./floor_controller")
    let users = []
    const building = await Building.findOne({ where: { id: buildingId } })
    const floors = await building.getFloors()
    // console.log(floors);
   if(floors.length!==0){
    for (let floor of floors) {
      const floorId = floor.id
      users = [...users, ...((await FloorController.getUsers(floorId,limit,page)).Users)]
    }
   } 
   let count =users.length
   let Users =users
   users = users.slice((page - 1) * limit, (page - 1) * limit+limit) ||users.slice((page - 1) * limit, count-(page - 1) * limit)||users;
    return {users,count,Users}
  },



  delBuilding: async function(id) {
    const { setUserRoomNull } = require("./user_controller")
    const Users = (await this.getUsers(id)).Users
    Users.forEach(User => {
      setUserRoomNull(User.id)
    })
    await Floor.destroy({ where: { buildingId:id } })
    await Room.destroy({ where: { buildingId:id } })
    return await Building.destroy({ where: { id } })
  }
}
