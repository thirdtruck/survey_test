"use strict";

var _ = require('underscore');
var nodeUUID = require('node-uuid');
var Promise = require('bluebird').Promise;
var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    login: DataTypes.STRING, // TODO: Enforce uniqueness on this.
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
    timestamps: false,
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Response);
        User.hasMany(models.Question);
      },
      // TODO: Rename to getLoggedInOrAnonymous. Otherwise, this sounds like it should return a boolean.
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
    instanceMethods: {
      validPassword: function(password) {
        var user = this;
        console.log('Validating password', password, 'for user', user.id);
        return bcrypt.compareSync(password, user.get('passwordHash'));
      }
    }
  });
  return User;
};
