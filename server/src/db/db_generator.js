const { databaseConfig } = require("../config")
const db = require("./index")
const User = require("../model/user_model")
const Token = require("../model/token_model")

const Room = require("../model/room_model")
const Floor = require("../model/floor_model")
const Building = require("../model/building_model")
const Cleaner = require("../model/cleaner_model")
const Repair = require("../model/repair_model")
const Notice = require("../model/notice_model")

// 创建表关系
User.hasMany(Token)
User.hasMany(Repair)
User.hasMany(Notice)
User.belongsTo(Room)

Notice.belongsTo(User)

Room.hasMany(User)
Room.hasMany(Repair)
Room.belongsTo(Floor)
Room.belongsTo(Building)

Repair.belongsTo(User)
Repair.belongsTo(Room)

Floor.hasMany(Room)
Floor.belongsTo(Building)
Floor.belongsTo(Cleaner)

Cleaner.hasMany(Floor)
Cleaner.belongsTo(Building)

Building.hasMany(Floor)
Building.hasMany(Room)
Building.hasMany(Cleaner)

Building.belongsToMany(User, { as: "Admins", through: "admins" })
User.belongsToMany(Building, { as: "", through: "admins" })

// 生成默认数据
const { hash } = require("../utils/bcypt")
async function createDefaultData() {
  // 创建一个管理员
  const admin = await User.create({
    account: "admin",
    password: hash("123456"),
    role: "admin",
    name: "李管管"
  })
  // 创建一个超级管理员
  const superAdmin = await User.create({
    account: "superAdmin",
    password: hash("123456"),
    role: "superAdmin",
    name: "李超管"
  })

  // 创建宿舍楼
  const building = await Building.createBuilding({
    name: "A栋"
  })
  const buildingB=await Building.createBuilding({
    name: "B栋"
  })
  const buildings = await Building.findAll({ attributes: ["id"] })
  buildings.forEach(async (building) => {
    const instance = await Building.findByPk(building.id);
    await instance.addAdmins(admin.id);
  });

  // 创建保洁员
  const cleaner = await Cleaner.createCleaner({
    name: "帆帆阿姨",
    phone: "13822222222"
  })
  // 为宿舍楼添加保洁员
  await Building.addCleaner(building.id, cleaner.id)


  // 创建楼层
  for (let i = 0; i < 10; i++) {
    const layer = i + 1
    const number = i + 101
    const Cfloor = await Floor.createFloor({
      layer,
      buildingId: null
    })
    await Building.addFloor(building.id, Cfloor)
    const floor = await Floor.findOne({
      where: { buildingId: building.id, layer: layer }
    })
    // 创建房间

    const peopleNumArr = [1, 2, 4]
    const rentArr = [2000, 3000, 4000]

    const peopleNum =
      peopleNumArr[Math.floor(Math.random() * peopleNumArr.length)]
    const rent = rentArr[Math.floor(Math.random() * rentArr.length)]
    const room = await Room.createRoom({
      number: number,
      floorId: floor.id,
      buildingId: floor.buildingId,
      status: 1,
      peopleNum,
      rent
    })
    // 为宿舍添加多个教师
    await User.create({
      account: "12345" + i,
      password: hash("123456"),
      name: "测试员" + i,
      role: "teacher",
      phone: "123456789011",
      roomId: room.id,
      checkTime: new Date(),
      term: 12,
      rent: room.rent * 12
    })
    if(peopleNum!==1){
      await User.create({
        account: "12312" + i,
        password: hash("123456"),
        name: "体验员" + i,
        role: "teacher",
        phone: "123456789011",
        roomId: room.id,
        checkTime: new Date(),
        term: 6,
        rent: room.rent * 6
      })
  
    }
    
    // 创建评价
    const repair = await Repair.createRepair({
      repairType: "水电报修",
      content: "空调坏了",
      userId: admin.id,
      roomId: room.id
    })
    await Notice.create({
      title: "停电通知",
      content: "全部公寓于2023/4/12 下午2点停电1小时",
      userId: admin.id
    })
  }

  for (let i = 0; i < 10; i++) {
    const layer = i + 1
    const number = i + 111
    const Cfloor = await Floor.createFloor({
      layer,
      buildingId: null
    })
    await Building.addFloor(buildingB.id, Cfloor)
    const floor = await Floor.findOne({
      where: { buildingId: buildingB.id, layer: layer }
    })
    // 创建房间

    const room = await Room.createRoom({
      number,
      floorId: floor.id,
      buildingId: floor.buildingId,
      status: 1,
      peopleNum:1,
      rent:10000
    })
    // 为宿舍添加多个教师
    await User.create({
      account: "66666" + i,
      password: hash("123456"),
      name: "贵宾" + i,
      role: "teacher",
      phone: "123456789011",
      roomId: room.id,
      checkTime: new Date(),
      term: 12,
      rent: room.rent * 12
    })
    
  }


}

module.exports = function() {
  // 同步表数据

  console.log("DataBase Syncing ... ...")
  db.sync({
    force: databaseConfig.rebuild
  })
    .then(() => {
      if (databaseConfig.rebuild) {
        createDefaultData()
      }
    })
    .then(() => {
      console.log("DataBase Sync done")
    })

  async function checkExpireDate() {
    try {
      // 从数据库中查找所有用户的租期和入住时间
      const users = await User.findAll({
        attributes: ["id", "term", "checkTime"]
      })

      for (const user of users) {
        const term = user.term
        const checkInDate = new Date(user.checkTime)

        // 计算到期日期
        const expireDate = new Date(checkInDate.getTime())
        expireDate.setMonth(expireDate.getMonth() + term)

        // 如果当前时间大于到期日期，则清空入住时间
        if (new Date() > expireDate) {
          await User.update(
            {
              checkTime: null
            },
            {
              where: {
                id: user.id
              }
            }
          )
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  // 每天检查一次到期时间并清空入住时间
  setInterval(checkExpireDate, 24 * 60 * 60 * 1000)
}
