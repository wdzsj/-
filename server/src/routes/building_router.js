const Router = require("koa-router")
const ResBody = require("../struct/ResBody")
const { Op, fn, col } = require("sequelize")
const { Building, User, Room, Floor } = require("../model")
const { BuildingController } = require("../controller")
const router = new Router()
const utils = require("../utils/index.js")
const moment = require("moment")

// 全部宿舍楼信息
router.get("/getBuildings", async ctx => {
  const buildings = await Building.findAll()
  for (let building of buildings) {
    building.setDataValue(
      "floorCount",
      await Floor.count({ where: { buildingId: building.id } })
    )
    building.setDataValue(
      "roomCount",
      await Room.count({ where: { buildingId: building.id } })
    )
    building.setDataValue(
      "userCount",
      await (await BuildingController.getUsers(building.id)).count
    )
  }
  ctx.body = new ResBody({ data: { buildings } })
})

// 管理员管理的宿舍楼
router.get("/getManageBuildings", async ctx => {
  const { role, userId } = ctx.state.user
  const user = await User.findById(userId)
  let buildings = []
  switch (user.role) {
    case "superAdmin":
      buildings = await Building.findAll()
      break
    case "admin":
      buildings = await user.getBuildings()
      break
    default:
      buildings = []
      break
  }
  ctx.body = new ResBody({ data: { buildings, role } })
})

router.get("/getBuildingInfo", async ctx => {
  const { buildingId } = ctx.request.query
  const building = await Building.findOne({ where: { id: buildingId } })
  const result = building.toJSON()
  result.floorCount = await Floor.count({ where: { buildingId } })
  result.roomCount = await Room.count({ where: { buildingId } })
  result.userCount = (await BuildingController.getUsers(buildingId)).count
  const rooms = await Room.findAll({ where: { buildingId } })
  result.peopleNumCount = rooms.reduce(
    (total, room) => total + room.peopleNum,
    0
  )
  ctx.body = new ResBody({ data: result })
})

router.get("/getBuildingsInfo", async ctx => {
  const buildings = await Building.findAll()

  const data = { columns: ["周期"], rows: [] }
  const dataCount = 5 // 获取的记录条数
  const dataStep = 180 // 每条记录相隔的条数

  // 初始化记录值
  for (let i = 0; i <= dataCount; i++) {
    if (i < dataCount) {
      data.rows.push({ 周期: `近${(i + 1) * dataStep}天` })
    } else {
      data.rows.push({ 周期: `近900+天` })
    }
  }

  data.columns.push("所有公寓")
  const peopleNumCount = await Room.sum("peopleNum") //所有楼可住人数
  for (let i = 0; i <= dataCount; i++) {
    const days = (i + 1) * dataStep
    const checkTimeThreshold = moment()
      .subtract(days, "days")
      .valueOf()
    let occupiedUserCount = ""
    if (i !== dataCount) {
      occupiedUserCount = await User.count({
        where: {
          checkTime: { [Op.gte]: checkTimeThreshold },
          roomId: { [Op.not]: null }
        }
      })
    } else {
      occupiedUserCount = await User.count({
        where: { roomId: { [Op.not]: null } }
      })
    }
    const occupancyRate = (occupiedUserCount / peopleNumCount).toFixed(4)
    data.rows[i]["所有公寓"] = occupancyRate
  }

  // 遍历每个楼
  for (let building of buildings) {
    data.columns.push(building.name)
    for (let i = 0; i <= dataCount; i++) {
      const days = (i + 1) * dataStep
      const rooms = await Room.findAll({ where: { buildingId: building.id } })
      const roomIds = rooms.map(room => room.id)
      const peopleNumCount = rooms.reduce(
        (total, room) => total + room.peopleNum,
        0
      ) //每个楼可住人数

      const checkTimeThreshold = moment()
        .subtract(days, "days")
        .valueOf()
      let occupiedUserCount = ""
      if (i !== dataCount) {
        occupiedUserCount = await User.count({
          where: {
            checkTime: { [Op.gte]: checkTimeThreshold },
            roomId: roomIds
          }
        })
      } else {
        occupiedUserCount = await User.count({ where: { roomId: roomIds } })
      }
      const occupancyRate = (occupiedUserCount / peopleNumCount).toFixed(4)
      data.rows[i][building.name] = occupancyRate
    }
  }
  ctx.body = new ResBody({ data })
})

router.get("/getSum", async ctx => {
  const result = {}
  result.buildingCount = await Building.count()
  result.roomCount = await Room.count() //所有楼房间数
  result.userCount = await User.count({
    //所有楼已住人数
    where: { roomId: { [Op.not]: null } }
  })
  result.floorCount = await Floor.count()
  const rooms = await Room.findAll()
  result.peopleNumCount = rooms.reduce(
    (total, room) => total + room.peopleNum,
    0
  ) //所有楼可住人数
  ctx.body = new ResBody({ data: result })
})

router.post("/addBuildingWithRoom", async ctx => {
  const { role } = ctx.state.user
  if (role !== "superAdmin") {
    throw new Error("403-拒绝访问API")
  }
  const {
    name,
    floorCount,
    roomCount,
    rent =3000,
    peopleNum=4 
  } = ctx.request.body
 
  console.log(ctx.request.body);
  utils.checkParams({ name, floorCount, roomCount })
  const building = await Building.createBuilding({ name })
  // 为宿舍楼添加楼层
  for (let i = 1; i <= floorCount; i++) {
    const floor = await Floor.createFloor({ layer: i, buildingId: building.id })
    await Building.addFloor(building.id, floor)
    // 为楼层添加房间
    for (let j = 1; j <= roomCount; j++) {
      await Room.create({
        number: i * 100 + j,
        floorId: floor.id,
        buildingId: building.id,
        rent,
        peopleNum
      })
    }
  }
  ctx.body = new ResBody({ data: building })
})

router.del("/delBuilding", async ctx => {
  const { role } = ctx.state.user
  if (role !== "superAdmin") {
    throw new Error("403-拒绝访问API")
  }
  const { id } = ctx.request.query
  const result = await BuildingController.delBuilding(id)
  ctx.body = new ResBody({ data: result })
})

router.get("/getAdminTableData", async ctx => {
  const { buildingId } = ctx.request.query
  utils.checkParams({ buildingId })
  const building = await Building.findOne({ where: { id: buildingId } })
  const admins = await building.getAdmins()
  ctx.body = new ResBody({ data: { admins, total: admins.length } })
})

router.get("/getCleanerTableData", async ctx => {
  const { buildingId } = ctx.request.query
  utils.checkParams({ buildingId })
  const building = await Building.findOne({ where: { id: buildingId } })
  const cleaners = await building.getCleaners()
  ctx.body = new ResBody({ data: { cleaners, total: cleaners.length } })
})

router.post("/addAdminToBuilding", async ctx => {
  const { adminAccount, buildingId } = ctx.request.body
  const admin = await User.findOne({
    where: { account: adminAccount, role: "admin" }
  })
  if (!admin) {
    throw new Error("找不到该用户")
  }

  const building = await Building.findByPk(buildingId)
  const result = await building.addAdmins(admin.id)
  if (!result) {
    throw new Error("403-目标管理员已为当前宿舍楼的管理员，添加失败")
  }
  ctx.body = new ResBody({ data: { result } })
})

router.del("/removeBuildingAdmin", async ctx => {
  const { adminId, buildingId } = ctx.request.query
  utils.checkParams({ adminId, buildingId })
  const building = await Building.findOne({ where: { id: buildingId } })
  const admin = await User.findOne({ where: { id: adminId } })
  const result = await building.removeAdmin(admin)
  ctx.body = new ResBody({ data: { effectRow: result } })
})

module.exports = router.routes()
