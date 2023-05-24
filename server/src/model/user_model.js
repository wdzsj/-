const db = require("../db/index")
const { DataTypes } = require("sequelize")
const bcypt = require("../utils/bcypt")



const User = db.define("user", {
  // User 表的 id 必须创建，否则 account 会被代替为用户 id
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  age:{
     type:DataTypes.INTEGER
  },
 sex:{
    type: DataTypes.STRING,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: "teacher" // 可能值：teacher admin superAdmin
  },
  name: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  identity:{
    type: DataTypes.STRING,
    unique:true,
  },
  checkTime: {
    comment: "入住宿舍时间",
    type: DataTypes.DATE
  },
  term: {
    type: DataTypes.INTEGER
  },
  rent:{
    type: DataTypes.INTEGER
  },
  avatar:{
    type: DataTypes.STRING,
  },
  relet:{
    type: DataTypes.INTEGER
  }
},
{
  paranoid:true
}
)

User.createUser = (account, password) => {
  const user = User.build({ account, password: bcypt.hash(password) })
  return user.save()
}
User.findByAccount = account => {
  return User.findOne({ where: { account } })
}
User.findById = id => {
  return User.findOne({ where: { id } })
}



module.exports = User
