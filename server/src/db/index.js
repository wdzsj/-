const  Sequelize  = require("sequelize")
const { databaseConfig } = require("../config")

const { host, name, user, password, logging } = databaseConfig
const db = new Sequelize(name, user, password, {
  host: host,
  dialect: "mysql",
  logging: logging
})

// 数据库连接测试（仅供调试使用）

db.authenticate()
  .then(() => {
    console.log("数据连接成功")
  })
  .catch(err => {
    console.error("数据库连接失败:", err)
  })

module.exports = db
