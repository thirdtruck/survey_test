"use strict";
module.exports = function(sequelize, DataTypes) {
  var Answer = sequelize.define("Answer", {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Answer.belongsTo(models.Question);
        Answer.hasMany(models.Response);
      }
    },
    timestamps: false
  });
  return Answer;
};
