"use strict";
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    login: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    anonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    uuid: {
      type: DataTypes.UUID
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Response);
      }
    },
    timestamps: false
  });
  return User;
};
