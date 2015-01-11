"use strict";
module.exports = function(sequelize, DataTypes) {
  var Question = sequelize.define("Question", {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Question.hasMany(models.Answer);
      }
    },
    timestamps: false
  });
  return Question;
};
