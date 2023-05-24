const db = require("../db/index")
const { DataTypes, Model } = require("sequelize")
const Building = require("./building_model")




const Room=db.define('room',
  {
    number: {
      type: DataTypes.INTEGER,
      comment: "房间号",
      unique: "compositeIndex",
    },
    buildingId: {
      type: DataTypes.INTEGER,
      references: {
        model: Building,
        key: "id"
      },
      unique: "compositeIndex"
    },
    status: {
      comment: "宿舍状态，可入住为1，不可入住为0",
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    peopleNum: {
      comment: "房间可住人数",
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rent: {
      type: DataTypes.INTEGER,
     
    },
  },
  
)
Room.createRoom= async({
  number,
  status = 1,
  floorId,
  buildingId,
  peopleNum =4,
  rent,
 
}) =>{
  try {
    return await Room.create({
      number,
      status,
      floorId,
      buildingId,
      peopleNum,
      rent,
    })
  } catch (error) {
    console.log(error)
    throw new Error("创建房间失败")
  }
}


module.exports = Room
