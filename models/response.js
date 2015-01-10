"use strict";
module.exports = function(sequelize, DataTypes) {
  var Response = sequelize.define("Response", {
    title: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Response.belongsTo(models.Answer);
        Response.belongsTo(models.User);
      }
    }
  });
  return Response;
};
