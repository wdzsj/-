const db = require("../db/index")
const { DataTypes, Model } = require("sequelize")

  

const Cleaner=db.define('cleaner',
  {
    name: {
      comment: "保洁员姓名",
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      comment: "保洁员电话",
      type: DataTypes.STRING
    }
  },
 
)
Cleaner.createCleaner=async({ name, phone, buildingId }) =>{
  return await Cleaner.create({ name, phone, buildingId })
}
module.exports = Cleaner
