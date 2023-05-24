const Router = require("koa-router")
const ResBody = require("../struct/ResBody")
const { Repair,Room } = require("../model")
const { RepairController } = require("../controller")
const utils = require("../utils/index")
const { Op } = require("sequelize")
const router = new Router()

router.get("/getRepairs", async ctx => {
  const {
    roomId,
    userId,
    page = 1,
    limit = 10,
    endTime,
    startTime,
    now = new Date(),
    isDay 
  } = ctx.request.query

  let past=isDay || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  let where = {
    createdAt: {
      [Op.gte]: past,
      [Op.lte]: now
    }
  }
  if (startTime) {
    where = {
      createdAt: {
        [Op.gte]: startTime,
        [Op.lte]: endTime
      }
    }
    if (userId) {
      // Filter by userId
      where.userId = userId
    } else if (roomId) {
      // Filter by roomId
      where.roomId = roomId
    }
  } else if (roomId&&isDay) {
    // Filter by roomId
    where.roomId = roomId
  } else if (userId) {
    // Filter by userId
    where.userId = userId
  }else if (roomId) {
    // Filter by roomId
    where.roomId = roomId
  } else {
    where = {}
  }

  // Find matching rows and count
  const [repairs, totalCount] = await Promise.all([
    Repair.findAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit: limit * 1
    }),
    Repair.count({ where })
  ])
  ctx.body = new ResBody({
    data: {
      repairs: await RepairController.getRepairsInfo(repairs),
      totalCount
    }
  })
})

router.post("/addRepair", async ctx => {
  const { userId } = ctx.state.user
  const data = ctx.request.body
  const {roomId,number,...cootent}=data
  data.userId=userId
  if(data.number){
   const room =await Room.findOne({where:{number:data.number}})
   data.roomId=room.id
  }
  utils.checkParams(cootent)
  const result = await Repair.create(data)
  ctx.body = new ResBody({ data: result })
})

router.post("/removeRepairs", async ctx => {
  const { ids } = ctx.request.body
console.log(ctx.request.body);
  const result = await Repair.destroy({ where: { id: ids } })
  ctx.body = new ResBody({ data: { effectRows: result } })
})

router.put("/handleRepairs", async ctx => {
  const {ids} = ctx.request.body // 传入的数组

 const updatedAt=new Date()

  // 查询所有记录
  const repairs = await Repair.findAll({ where: { id: ids } })

  // 更新所有记录
  await Promise.all(repairs.map(async (repair) => {
    repair.setDataValue("updatedAt", updatedAt) // 更新数据
    await repair.save() // 保存记录
  }))

  ctx.body = new ResBody({ data: { res: "修改成功" } })
})

router.put('/updateRepair:id', async ctx => {
  const repairData = ctx.request.body;
  const repairId = ctx.params.id;
  try {
    // 更新指定的通知数据
   const res= await Notice.update(repairData,{where:{id:repairId}});
    // 返回更新后的通知数据
    ctx.body = new ResBody({ data: res[0] });
  } catch (err) {
    // 如果更新失败，则返回错误响应
    ctx.body = new ResBody({ code: 500, message: '更新通知数据时出错', error: err });
  }
})


module.exports = router.routes()
