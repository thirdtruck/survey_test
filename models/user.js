"use strict";

var _ = require('underscore');
var nodeUUID = require('node-uuid');
var Promise = require('bluebird').Promise;

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
      },
      loggedInOrAnonymous: function(findParams) {
        /* Not checking for null .where because calls to 
         * this method that lack .where should break 
         * and call to #createAnonymous explicitly 
         * instead.
         */
        if (_.isUndefined(findParams.where.uuid)) {
          return User.createAnonymous();
        }
        
        return User.find(findParams)
          .then(function(user) {
            
            if (_.isNull(user)) {
              return User.createAnonymous(callback);
            } else {
              /* TODO: Is there a more "natural" way 
               * of doing this that doesn't involve 
               * explicit Promise creation?
               */
              return new Promise(function(resolve) {
                resolve(user);
              });
            }
          });
      },
      createAnonymous: function() {
        var uuid = nodeUUID.v4();
        console.log('Creating a new anonymous user with UUID: ' 
                      + uuid + '.');
        return User.create({
          anonymous: true,
          uuid: uuid
        });
      }
    },
    timestamps: false
  });
  return User;
};
