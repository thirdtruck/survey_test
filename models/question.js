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
        Question.belongsTo(models.User); /* TODO: Use #belongsTo on Answer and Response. */
      }
    },
    timestamps: false
  });
  return Question;
};
