const sequelize = require("sequelize")
const { Op,  } = require("sequelize")
const _ = require('lodash');
const Router = require("koa-router")
const ResBody = require("../struct/ResBody")
const { Room, Floor, User, Building } = require("../model")
const router = new Router()

router.get("/getRooms", async ctx => {
  const {
    floorId,
    buildingId,
    roomId,
    layer,
    limit = 10,
    page = 1,
    number,
    rent,
    peopleNum,
    currentPeopleNum
  } = ctx.request.query

  let pageSize = null
  let where = {}

  if (roomId) {
    where = { ...where, id: roomId }
  } else if (floorId) {
    where = { ...where, floorId }
  } else if (buildingId && !layer) {
    where = { ...where, buildingId }
  } else if (buildingId && layer) {
    const floor = await Floor.findOne({ where: { buildingId, layer } })
    where = { ...where, floorId: floor.id }
  } else if (number) {
    where = { ...where, number }
  } else if (currentPeopleNum) {
    if (rent) {
      where.rent = rent
    }
    if (peopleNum) {
      where.peopleNum = peopleNum
    }
  } else if (rent && peopleNum) {
    where = { ...where, rent, peopleNum }
  } else if (rent) {
    where = { ...where, rent }
  } else if (peopleNum) {
    where = { ...where, peopleNum }
  }

  if (currentPeopleNum) {
    const userRoomCounts = await User.findAll({
      attributes: ["roomId", [sequelize.fn("COUNT", "roomId"), "count"]],
      group: ["roomId"],
      having: {
        count: currentPeopleNum
      }
    })
    const roomIdList = userRoomCounts.map(userCount => userCount.roomId)
    where = {
      [Op.and]: [{ id: { [Op.in]: roomIdList } }, { ...where }]
    }
  }
  const { count, rows } = await Room.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit: limit * 1
  })
  rooms = rows
  pageSize = count

  // 计算每个房间当前的人数
  for (let index in rooms) {
    const room = rooms[index]
    const roomId = room.id
    const currentPeopleNum = await User.count({ where: { roomId } })
    room.dataValues.currentPeopleNum = currentPeopleNum
    room.dataValues.isFull = Boolean(currentPeopleNum === room.peopleNum)
    const building = await Building.findOne({ where: { id: room.buildingId } })
    room.dataValues.buildingName = building.name
  }

  ctx.body = new ResBody({
    data: { rooms, pageSize }
  })
})

router.get("/getRoomInfo", async ctx => {
  const { roomId } = ctx.request.query
  const roomInfo = await Room.findOne({
    where: { id: roomId },
    include: [{ model: Floor }, { model: Building }, { model: User }]
  })
  ctx.body = new ResBody({ data: roomInfo })
})

router.put("/setRoomTableData:id", async ctx => {
  let roomData = ctx.request.body
  const id = ctx.params.id
  const room = await Room.update(roomData, { where: { id } })
  const res = room.length > 0 ? "修改成功" : "修改失败"
  ctx.body = new ResBody({ data: { res } })
})
router.post("/delRoomTableData", async ctx => {
  let { roomIds } = ctx.request.body
  console.log(ctx.request.body)
  const userCount = await User.count({ where: { roomId: roomIds } })
  let res
  if (userCount === 0) {
    const room = await Room.destroy({ where: { id: roomIds } })
    res = room.length > 0 ? "成功" : "成功"
  } else {
    const err = new Error(`选中的房间现住人数不为空，不可删除`)
    throw err
  }
  ctx.body = new ResBody({ data: { res } })
})

router.get("/getRoomType", async ctx => {
  const { rent, peopleNum, buildingId } = ctx.request.query
  let w = {}
  let emptyCount = null
  const queryOptions = {
    attributes: [
      "peopleNum",
      "rent",
      [sequelize.fn("count", sequelize.col("peopleNum")), "count"]
    ],
    group: ["peopleNum","rent"],
    where: {}
  }

  if (peopleNum) {
    w.peopleNum = peopleNum
    if (peopleNum == 2) {
      queryOptions.where.peopleNum = { [Op.gte]: peopleNum }
    } else {
      queryOptions.where.peopleNum = peopleNum
    }
  }
  if (rent) {
    queryOptions.where.rent = { [Op.lte]: rent }
  }
  if (buildingId) {
    queryOptions.where.buildingId = buildingId
    w.buildingId = buildingId
    if (peopleNum) {
      w.peopleNum = peopleNum
    }
    const Rooms = await Room.findAll({ where: w })
    const roomIds = Rooms.map(room => room.id)
    const userCount = await User.count({ where: { roomId: roomIds } })
    const peopleNumCount = Rooms.reduce(
      (total, room) => total + room.peopleNum,
      0
    )
    emptyCount = peopleNumCount - userCount
  }
  const rooms = await Room.findAll(queryOptions)

  ctx.body = new ResBody({ data: { rooms, emptyCount } })
})

router.put("/addRoomUser:id", async ctx => {
  const { account, ckeckTime = new Date(), term } = ctx.request.body
  const { id } = ctx.params
  const room = await Room.findOne({ where: { id } })
  const rent = room.rent * term
  const res = await User.update(
    { roomId: id, ckeckTime, rent, term },
    { where: { account } }
  )
  if (res[0] === 0) {
    const err = new Error("账号不存在")
    throw err
  }
  ctx.body = new ResBody({ data: { rent, res } })
})

router.get("/searchRoom", async ctx => {
  const { keywords } = ctx.request.query
  let Rooms = []
  if (keywords.trim()) {
    Rooms = await Room.findAll({
      where: {
        [Op.or]: {
          number: { [Op.like]: `%${keywords}%` }
        }
      }
    })
  }
  ctx.body = new ResBody({ data: { Rooms, total: Rooms.length } })
})

router.post("/addRoom", async ctx => {
  const data = ctx.request.body
  const { roomCount, ...roomInfo } = data
  const promises = []
  const room = await Room.findOne({
    attributes: [[sequelize.fn("max", sequelize.col("number")), "maxNumber"]],
    where: { floorId: roomInfo.floorId, buildingId: roomInfo.buildingId }
  })
  const maxNumber = room.get("maxNumber")
  for (let i = 1; i <= roomCount; i++) {
    // 创建一个新的房间对象
    const room = {
      number: maxNumber + i, // 房间编号
      ...roomInfo // 其他房间信息，例如楼层、房间类型等
    }
    // 将该房间插入到数据库中
    const promise = Room.create(room)
    promises.push(promise)
  }
  const building = await Building.findOne({
    where: { id: roomInfo.buildingId }
  })
  // 等待所有插入操作完成
  let newRooms = await Promise.all(promises)
  newRooms = newRooms.map(room => {
    return {
      number: room.number,
      rent: room.rent,
      buildingName: building.name
    }
  })
  ctx.body = new ResBody({ data: { newRooms } })
})

router.get("/roomOccupancy", async ctx => {
  async function getBuildingRoomOccupancy() {
    const allRoomCount = await Room.count()
    const buildingRoomCounts = await Room.findAll({
      attributes: [
        "buildingId",

        [sequelize.fn("count", sequelize.col("Building.id")), "count"]
      ],
      group: ["buildingId"],
      include: [{ model: Building, attributes: ["name"] }]
    })

    const buildingOccupancy = buildingRoomCounts.map(buildingRoomCount => {
      const { count, building } = buildingRoomCount.toJSON()
      const occupancy = (count / allRoomCount) * 100
      return {
        公寓名: building.name,
        房间个数: count,
        房间占比: occupancy.toFixed(2)
      }
    })

    return buildingOccupancy
  }

  const data = await getBuildingRoomOccupancy()
  ctx.body = new ResBody({ data: data })
})

router.get("/userDistribution", async ctx => {
  const userDistribution = await Room.findAll({
    attributes: [
      [sequelize.literal(`concat(peopleNum, '人间')`), "房间类型"],
      [sequelize.fn("sum", sequelize.col("peopleNum")), "人数"]
    ],
    group: "peopleNum"
  })

  ctx.body = new ResBody({ data: userDistribution })
})

router.get("/getBuildingRoomData", async ctx => {
  const rooms = await Room.findAll({
    attributes: ['number', 'peopleNum', 'rent'],
    include: {
      model: Building,
      attributes: ['name']
    },
    order: ['number'] // 按 Building.name 排序
  });
  const headers = ['房间号', '可住人数', '租金'];
  const groups = _.groupBy(rooms, room => room.building ? room.building.name : '未知'); // 使用 Lodash 分组
  const dataForExport = {};
 
  for (const groupName in groups) {
    dataForExport[groupName] = [];
    dataForExport[groupName].push(headers); // 添加表头行
    groups[groupName].forEach(room => {
      dataForExport[groupName].push([
        room.number,
        room.peopleNum,
        room.rent
      ]);
    });
  
  }
  
  ctx.body = new ResBody({ data: dataForExport })
})

module.exports = router.routes()
