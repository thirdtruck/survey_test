"use strict";
module.exports = function(sequelize, DataTypes) {
  var Answer = sequelize.define("Answer", {
    title: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Answer.belongsTo(models.Question);
      }
    },
    timestamps: false
  });
  return Answer;
};
