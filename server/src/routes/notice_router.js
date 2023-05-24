const Router = require("koa-router")
const ResBody = require("../struct/ResBody")
const { Notice,User } = require("../model")
const { NoticeController } = require("../controller")

const { Op} = require("sequelize")
const router = new Router()

router.get("/getNotices", async ctx => {
  const {
    page = 1,
    limit = 10,
    startTime,
    endTime,
    account
  } = ctx.request.query

  let where={}
  if (startTime) {
    where = {
      createdAt: {
        [Op.gte]: startTime,
        [Op.lte]: endTime
      }
    }}
    if (account) {
      let user =await User.findOne({where:{account}})
      where.userId = user.id
    }
  // Find matching rows and count
  const [notices, totalCount] = await Promise.all([
    Notice.findAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit: limit * 1,
      paranoid: false 
    }),
     Notice.count({ where, paranoid: false }) // add this option
  ])
  ctx.body = new ResBody({
    data: {
      notices: await NoticeController.getNoticesInfo(notices),
      totalCount
    }
  })
})

router.post("/destroyNotice", async ctx => {
  let { id } = ctx.request.body
    const notice = await Notice.destroy({ where: { id } })    
    const res = notice[0] 
  ctx.body = new ResBody({ data: { res} })
})

router.put('/restoreNotice', async (ctx) => {
  const {id} = ctx.request.body;
  console.log(ctx.request.body);
  let notice = [];
    notice = await Notice.restore({ where:{id} });
  const res = notice[0] 
  ctx.body = new ResBody({ data: { res } });
});

router.post('/removeNotice', async (ctx) => {
  const { id } = ctx.request.body
  console.log(ctx.request.body);
  const deletedCount = await Notice.destroy({ where: { id },paranoid: false,force: true, });
  const res = deletedCount 
  // console.log(deletedCount,id);
  ctx.body = new ResBody({ data: { res } });
});

router.post('/addNotice',async ctx=>{
  const noticeData=ctx.request.body
  try{ 
     await Notice.create(noticeData)
    ctx.body = new ResBody({ data: { res:1} 
    });
  }
    catch{
      ctx.body = new ResBody({ data: { res:0} });
    }

})

router.put('/updateNotice:id', async ctx => {
  const noticeData = ctx.request.body;
  const noticeId = ctx.params.id;
  try {
    // 更新指定的通知数据
   const res= await Notice.update(noticeData,{where:{id:noticeId}});
    // 返回更新后的通知数据
    ctx.body = new ResBody({ data: res[0] });
  } catch (err) {
    // 如果更新失败，则返回错误响应
    ctx.body = new ResBody({ code: 500, message: '更新通知数据时出错', error: err });
  }
});

module.exports = router.routes()
