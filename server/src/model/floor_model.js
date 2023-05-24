const db = require("../db/index")
const { DataTypes, Model } = require("sequelize")
const Building = require("./building_model")



const Floor=db.define('floor',
  {
    layer: {
      type: DataTypes.INTEGER,
      comment: "楼层",
      unique: "compositeIndex"
    },
    buildingId: {
      type: DataTypes.INTEGER,
      references: {
        model: Building,
        key: "id"
      },
      unique: "compositeIndex"
    }
  },
 
 
)
Floor.createFloor =async({ layer, buildingId }) =>{
  try {
    const floor = await Floor.create({ layer, buildingId })
    return floor
  } catch (e) {
    console.log(e)
    throw new Error("创建楼层失败")
  }
}


module.exports = Floor
