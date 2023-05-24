const db = require("../db/index")
const { DataTypes, Model } = require("sequelize")
const User = require("./user_model")
const Cleaner = require("./cleaner_model")

const Building = db.define(
  "building",
  {
    name: {
      comment: "楼宇名称",
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  
 
)
Building.hasBuilding = async id => {
  const building = await Building.findOne({ where: { id } })
  if (building === null) {
    return false
  } else {
    return true
  }
}
Building.createBuilding = async ({ name }) => {
  const building = await Building.create({ name })
  return building
}
// 为管理员授权管理一个楼
Building.addAdmins = async (buildingId, userId) => {
  try {
    const building = await Building.findByPk(buildingId)
    const user = await User.findByPk(userId)
    const result = await user.addAdmins(building)
    return result
  } catch (e) {
    throw new Error("已存在该管理员，添加失败")
  }
}
// 为一个管理员授权管理所有楼
Building.addBuildingAdmin = async userId => {
  try {
    const building = await Building.findAll({ attributes: ["id"] })
    for (let i = 0; i < building.length; i++) {
      let buildingId = building[i].dataValues.id
      
      await Building.addAdmins(buildingId, userId)
    }
   
  } catch (e) {
    throw new Error("已存在该管理员，添加失败")
  }
}
Building.addCleaner = async (buildingId, cleanerId) => {
  try {
    const cleaner = await Cleaner.findOne({ where: { id: cleanerId } })
    cleaner.buildingId = buildingId
    return await cleaner.save()
  } catch (e) {
    throw new Error("添加保洁员失败")
  }
}
Building.addFloor = async (buildingId, floor) => {
  try {
    floor.buildingId = buildingId
    return await floor.save()
  } catch (error) {
    console.log(error)
  }
}
module.exports = Building
