const db = require("../db/index")
const { DataTypes, } = require("sequelize")

const Notice=db.define('notice',
  {
    title: {
      
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      comment: "问题描述",
      type: DataTypes.STRING
    }
  },
  
  {
    paranoid:true
  }
)

module.exports = Notice
