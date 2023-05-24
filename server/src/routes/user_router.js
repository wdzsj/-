const path = require("path")
const fs = require("fs")
const sequelize =require('sequelize')

const Router = require("koa-router")
const { Op, where } = require("sequelize")
const ResBody = require("../struct/ResBody")
const bcypt = require("../utils/bcypt")
const { sysConfig } = require("../config")
const _ = require("lodash")

const { User, Token, Building, Floor, Room } = require("../model")
const {
  UserController,
  RoomController,
  FloorController,
  BuildingController
} = require("../controller")
const utils = require("../utils")

const router = new Router()
// 注册路由
router.post("/register", async ctx => {
  let { account, password } = ctx.request.body
  if ((await User.findByAccount(account)) !== null) {
    const err = new Error("400-职工号被注册")
    throw err
  }
  // 创建一个用户
  let user = await User.createUser(account, password)
  ctx.body = new ResBody({ data: user })
})

// 登录路由
router.post("/login", async ctx => {
  let { account, password } = ctx.request.body
  // 验证账号
  let user = await User.findByAccount(account)
  if (user === null) {
    let err = new Error("400-用户名不正确")
    throw err
  }
  // 通过令牌验证密码正确性
  let result = bcypt.verify(password, user.password)
  if (result) {
    //密码正确 生成token
    const token = await Token.createToken(user.id)
    ctx.body = new ResBody({ data: { token } })
  } else {
    // 密码不正确返回提示
    ctx.body = new ResBody({ success: false, msg: "密码错误" })
  }
})

router.get("/info", async ctx => {
  let token = ctx.req.headers.authorization
  const { tokenId, userId, exp, role } = ctx.state.user
  // 1. 计算Token 距离过去的时间
  const currentTime = parseInt(String(new Date().valueOf() / 1000))
  if (exp - currentTime < sysConfig.tokenExp / 2) {
    // 2. 如果相差超过一半时间，更新这个token
    Token.deleteById(tokenId)
    token = await Token.createToken(userId)
  }
  // 再次获取用户信息，前端在拿到用户信息后必须重新 设置 token，不断更新token
  let user = await User.findOne({ where: { id: userId } })
  if (role === "teacher" && user.roomId) {
    const room = await Room.findOne({ where: { id: user.roomId } })
    const floor = await Floor.findOne({ where: { id: room.floorId } })
    const building = await Building.findOne({ where: { id: room.buildingId } })
    user = user.toJSON()
    user.room = room
    user.floor = floor
    user.building = building
  }
  if (user.avatar) {
    user.avatar = `http://localhost:8080/upload/${user.avatar}`
  }

  // 返回数据中携带token
  if (user !== null) {
    user.token = token
    ctx.body = new ResBody({ data: user })
  } else {
    let e = new Error("未找到相关用户信息")
    throw e
  }
})

router.post("/updateInfo", async ctx => {
  const { userId } = ctx.state.user
  const resbody = ctx.request.body
  const user = await User.findOne({ where: { id: userId } })
  for (let key in resbody) {
    if (user[key] !== undefined && resbody[key]) {
      user[key] = resbody[key]
    }
  }
  if (resbody.password) {
    user.password = bcypt.hash(resbody.password)
  }
  ctx.body = new ResBody({ data: await user.save() })
})

// 得到用户表使用信息
router.get("/getUsers", async ctx => {
  const {
    userId,
    buildingId,
    roomId,
    relet,
    floorId,
    limit = 10,
    page = 1
  } = ctx.request.query
  let users = []
  let pageSize = 10
  let where={role: "teacher",}
  // 根据不同的参数，查询用户信息
  if (userId) {
    users = [await UserController.getUserInfo(userId, limit, page)]
    pageSize = 1
  } else if (roomId) {
    let res = await RoomController.getUsers(roomId, limit, page)
    pageSize = res.s
    users = res.users
  } else if (floorId) {
    let res = await FloorController.getUsers(floorId, limit, page)
    pageSize = res.count
    users = res.users
  } else if (buildingId) {
    let res = await BuildingController.getUsers(buildingId, limit, page)
    pageSize = res.count
    users = res.users
  } else {
    if(relet){
      where.relet={ [Op.not]: null }
    }
    // 没有参数查询全部信息
    const { count, rows } = await User.findAndCountAll({
      where,
      order: [["checkTime", "DESC"]],
      offset: (page - 1) * limit,
      limit: limit * 1
    })
    pageSize = count
    users = await UserController.getUsersInfo(rows)
  }

  ctx.body = new ResBody({
    data: { users, pageSize }
  })
})

router.get("/searchAdmin", async ctx => {
  const { keywords } = ctx.request.query
  let admins = []
  if (keywords.trim()) {
    admins = await User.findAll({
      where: {
        role: "admin",
        [Op.or]: {
          name: { [Op.like]: `%${keywords}%` },
          account: { [Op.like]: `%${keywords}%` }
        }
      }
    })
  }
  ctx.body = new ResBody({ data: { admins, total: admins.length } })
})

router.get("/searchUser", async ctx => {
  const { keywords } = ctx.request.query
  let Users = []
  if (keywords.trim()) {
    Users = await User.findAll({
      where: {
        [Op.or]: {
          name: { [Op.like]: `%${keywords}%` },
          account: { [Op.like]: `%${keywords}%` }
        }
      }
    })
  }
  ctx.body = new ResBody({ data: { Users, total: Users.length } })
})

router.post("/addAdmin", async ctx => {
  const UserRole = ctx.state.user.role
  if (UserRole !== "superAdmin") {
    throw new Error("403-无权访问")
  }
  let { role, name, account, phone, password } = ctx.request.body
  // 拿到参数通过工具包函数检查参数合法性
  utils.checkParams({ name, account, phone, role, password })
  // 检索账号是否重复
  if ((await User.findByAccount(account)) !== null) {
    const e = new Error("400-工号被注册")
    throw e
  }
  // 查询数据并返回
  let user = await User.create({
    name,
    phone,
    account,
    password: bcypt.hash(password),
    role
  })
  const buildings = await Building.findAll({ attributes: ["id"] })
  buildings.forEach(async building => {
    const instance = await Building.findByPk(building.id)
    await instance.addAdmins(user.id)
  })
  ctx.body = new ResBody({ data: user })
})

// 获取管理员数据
router.get("/getAdminTableData", async ctx => {
  const admins = await User.findAll({
    where: {
      role: { [Op.or]: ["admin", "superAdmin"] }
    },
    include: [{ model: Building }]
  })
  ctx.body = new ResBody({ data: { admins, total: admins.length } })
})
// 修改管理员数据
router.post("/setAdminTableData", async ctx => {
  let newAdmin = ctx.request.body
  console.log(newAdmin)
  const admins = await User.update(newAdmin, { where: { id: newAdmin.id } })
  const res = admins.length > 0 ? "修改成功" : "修改失败"
  ctx.body = new ResBody({ data: { res } })
})
// 删除管理员
router.post("/delAdminTableData", async ctx => {
  let { id } = ctx.request.body
  const admins = await User.destroy({ where: { id } })
  const res = admins.length > 0 ? "删除成功" : "删除失败"
  ctx.body = new ResBody({ data: { res } })
})

router.get("/getUserInfoByIdOrAccount", async ctx => {
  const { type, value } = ctx.request.query
  let userId = value
  if (type !== "id") {
    const user = await User.findOne({ where: { account: value } })
    if (!user) {
      throw new Error("无法找到该用户")
    }
    userId = user.id
  }
  const userInfo = await UserController.getUserInfo(userId)
  ctx.body = new ResBody({ data: userInfo })
})

router.put("/addCheckUser:id", async ctx => {
  const { roomId, ckeckTime = new Date(), term } = ctx.request.body
  const { id } = ctx.params
  await User.update({ roomId, ckeckTime, term }, { where: { id } })
  console.log(res)
  ctx.body = new ResBody({ data: { res } })
})

router.put("/removeCheckUser:id", async ctx => {
  const { id } = ctx.params
  const res = await User.update(
    { roomId: null, ckeckTime: null, term: null },
    { where: { id } }
  )
  ctx.body = new ResBody({ data: { res } })
})

router.post("/addTerm", async ctx => {
  const { term, ids } = ctx.request.body;

  const users = await User.findAll({ where: { id: ids } }); // 查询所有用户
  const roomIds = users.map(user => user.roomId); // 获取所有用户的 roomId 列表
  const rooms = await Room.findAll({ where: { id: roomIds } }); // 查询所有用户所在的房间信息

  // 并发处理每个用户的更改操作
  await Promise.all(
    users.map(async user => {
      const room = rooms.find(room => room.id === user.roomId); // 获取该用户所在的房间信息
      let where = {};
      if (user.term) {
        where.term = term + user.term * 1;
        where.rent = user.rent + user.term * room.rent * 1;
      }
      if (!user.checkTime) {
        where.checkTime = sequelize.literal('CURRENT_TIMESTAMP');
      }
      await User.update(where, { where: { id: user.id } });
    })
  );
  

  ctx.body = new ResBody({ data: { ids } });
});


router.post("/removeUser", async ctx => {
  const { id } = ctx.request.body
  // 批量删除用户
  const users = await User.destroy({ where: { id } })
  const res = users.length > 0 ? "删除成功" : "删除失败"
  ctx.body = new ResBody({ data: { res } })
})

router.post("/updateUserInfo", async ctx => {
  let resbody = ctx.request.body
  let room = {}
  const user = await User.findOne({ where: { id: resbody.id * 1 } })
  if (user.dataValues.roomId) {
    room = await Room.findOne({ where: { id: user.dataValues.roomId } })
    resbody.rent = room.dataValues.rent * resbody.term * 1
  }
  for (let key in resbody) {
    if (user[key] !== undefined && resbody[key]) {
      user[key] = resbody[key]
    }
  }
  if (resbody.password) {
    user.password = bcypt.hash(resbody.password)
  }
  ctx.body = new ResBody({ data: await user.save() })
})

router.post("/createUser", async ctx => {
  const { data, option } = ctx.request.body

  if (option.n) {
    if (!Number.isInteger(option.n * 1) || option.n <= 0) {
      const err = new Error("400-请输入正确的用户数量")
      throw err
    }

    const users = []
    const usedAccounts = []
    const usedIdentities = []
    const usedPhones = []
    const usedNames = []
    const rooms = await Room.findAll({
      where: { peopleNum: option.peopleNum, buildingId: option.buildingId }
    })

    let roomId = null

    let m = 0
    for (let j = 0; j < rooms.length; j++) {
      if (option.n * 1 === m) {
        break
      }

      const rent = rooms[j].rent * data.term
      const numPeopleInRoom = await User.count({
        where: { roomId: rooms[j].id }
      }) // count the number of people in the room

      if (numPeopleInRoom < rooms[j].peopleNum) {
        // if the room is not full
        roomId = rooms[j].id // assign the user to this room
        for (let k = 0; k < rooms[j].peopleNum - numPeopleInRoom; k++) {
          if (option.n * 1 === m) {
            break
          }
          let account = generateAccount(usedAccounts)
          const user = await User.findOne({ where: { account: account } })
          if (user) {
            account = generateAccount(usedAccounts)
          }
          let identity = generateIdentity(usedIdentities)
          console.log(identity)
          let phone = generatePhone(usedPhones)
          let age = generateAge()
          let sex = generateGender()
          let name = generateName(usedNames)

          newUser = await User.create({
            ...data,
            account,
            password: bcypt.hash("123456"),
            identity,
            phone,
            sex,
            age,
            roomId,
            rent,
            name
          })

          usedAccounts.push(account)
          usedIdentities.push(identity)
          usedPhones.push(phone)
          usedNames.push(name)
          users.push(newUser)
          m++
        }
      }
    }

    ctx.body = new ResBody({ data: { users } })
  } else {
    const newUser = await createUser({
      ...data,
      password: bcypt.hash("123456")
    })

    ctx.body = new ResBody({ data: { user: newUser } })
  }
})

router.get("/getUserInfoForExport", async ctx => {
  const users = await User.findAll({
    attributes: ["account", "name", "phone", "rent"],
    include: {
      model: Room,
      attributes: ["number"],
      include: {
        model: Building,
        attributes: ["name"]
      }
    },
    order: ["account"],
    where: { roomId: { [Op.not]: null } }
  })
  const headers = ["账号", "姓名", "房间号", "手机号码", "租期"]
  const groups = _.groupBy(users, user =>
    user.room ? (user.room.building ? user.room.building.name : "未知") : "未知"
  )
  const dataForExport = {}

  for (const groupName in groups) {
    dataForExport[groupName] = []
    dataForExport[groupName].push(headers)
    groups[groupName].forEach(user => {
      const row = [
        user.account,
        user.name,
        // user.room ? user.room.building ? user.room.building.name : '' : '',
        user.room ? user.room.number : "",
        user.phone,
        user.term
      ]
      dataForExport[groupName].push(row)
    })
  }

  ctx.body = new ResBody({ data: dataForExport })
})

// 添加路由，用于处理文件上传请求
// 添加路由，用于处理文件上传请求
router.post("/upload", async ctx => {
  try {
    const file = ctx.request.files.file // 获取上传的文件对象
    const avatar = path.basename(file.path)

    const user = await User.findById(ctx.state.user.userId)
    if (user.avatar) {
      // 如果用户原来有头像，则删除原来的头像文件
      const oldAvatarPath = path.join(
        process.cwd(),
        "static",
        "upload",
        user.avatar
      )
      if (oldAvatarPath) {
        fs.unlinkSync(oldAvatarPath)
      }
    }
    user.avatar = avatar
    await user.save()

    ctx.body = new ResBody({
      data: { url: `http://localhost:8080/upload/${avatar}` }
    })
  } catch (err) {
    console.log(err)
    ctx.throw(500, "Internal Server Error")
  }
})

router.get('/exportTemplate', async ctx => {
 
  ctx.body = new ResBody({
    data: { url: `http://localhost:8080/static/img/房屋租赁合同.doc` }
  })
 
});

router.put("/applyRelet:id", async ctx => {
  const { id } = ctx.params
  const user = await User.findById(id)
  if (!user) {
    ctx.throw(404, "User not found")
  }
  user.relet = 1
  await user.save()
  ctx.body = new ResBody({ data: user })
})

router.get("/getReletUser", async (ctx) => {
  const users = await User.findAll({where: {relet: { [Op.not]: null }} });
  ctx.body = new ResBody({ data: users });
});

router.post("/handleRelet", async (ctx) => {
  try {
    const { ids } = ctx.request.body;
    const users = await User.update(
      {
        rent: sequelize.literal('rent+  (SELECT rent FROM Rooms WHERE Rooms.id = Users.roomId) * 12'),
        relet: null,
        term: sequelize.literal('term + 12')
      },
      { where: { id: { [Op.in]: ids } } }
    );
    ctx.body = new ResBody({ data: users });
  } catch (err) {
    console.error(err);
    ctx.throw(500, "Internal Server Error");
  }
});


async function createUser(data) {
  const user = await User.findOne({ where: { account: data.account } })
  if (user) {
    const err = new Error("400-职工号被注册")
    throw err
  }

  const newUser = await User.create(data)
  return newUser
}

function generateAccount(usedAccounts) {
  let account = ""
  while (account.length !== 10 || usedAccounts.includes(account)) {
    account = Math.floor(Math.random() * 9000000000) + 1000000000
    account = "190" + account.toString().substring(3)
  }
  return account
}

function generatePhone(usedPhones) {
  let phone = ""

  while (phone.length !== 11 || usedPhones.includes(phone)) {
    phone = "1"
    for (let i = 1; i < 11; i++) {
      phone += Math.floor(Math.random() * 10).toString()
    }
  }
  return phone
}
function generateAge() {
  return Math.floor(Math.random() * (60 - 18 + 1)) + 18
}

function generateGender() {
  return Math.random() < 0.5 ? "男" : "女"
}

function generateIdentity(usedIdentities) {
  let identity = ""
  do {
    identity =
      Math.floor(Math.random() * 900000000000000000) + 100000000000000000
    identity = "4509" + identity.toString().substring(4)
  } while (
    identity.toString().length !== 18 ||
    usedIdentities.includes(identity)
  )

  return identity
}

function generateName(usedNames) {
  const surnames = ["张", "王", "李", "赵", "陈", "刘", "周", "黄", "钱", "孙"]
  const names = ["明", "红", "伟", "静", "强", "", "洋", "芳", "娟", "峰"]
  const characters = ["梦", "静", "雨", "峰", "波", "", "秀", "芳", "杰", "辉"]

  let surname = surnames[Math.floor(Math.random() * surnames.length)]
  let name = names[Math.floor(Math.random() * names.length)]
  let character = characters[Math.floor(Math.random() * characters.length)]

  while (surname + name + character === usedNames) {
    surname = surnames[Math.floor(Math.random() * surnames.length)]
    name = names[Math.floor(Math.random() * names.length)]
    character = characters[Math.floor(Math.random() * characters.length)]
  }

  const fullName = surname + name + character

  return fullName
}

module.exports = router.routes()
