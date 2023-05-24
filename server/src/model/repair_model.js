const db = require("../db/index")
const { DataTypes, } = require("sequelize")

const Repair=db.define('repair',
  {
    repairType: {
      
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      comment: "问题描述",
      type: DataTypes.STRING
    }
  },
  
)
Repair.createRepair =async({ repairType, content = "", userId, roomId }) =>{
  return await Repair.create({ repairType, content, userId, roomId })
}
module.exports = Repair
