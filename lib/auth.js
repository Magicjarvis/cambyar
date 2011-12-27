var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var models = require('./models');
var User = models.User;

exports.authenticate = function authenticate(login, password) {
    var promise = this.Promise();
    User.findOne({'username': login.toLowerCase()}, function(err, user) {
        
        if(err) return promise.fulfill(['Database error']);

        if(!user) return promise.fulfill(['No Such User']);
        bcrypt.compare(password, user.password, function(err, res) {
            if(res) promise.fulfill(user);
            promise.fulfill(['Bad Password']);
        });
        return promise; 
    });

    return promise;

}

exports.validateRegistration = function validateRegistration(form) {
   var promise = this.Promise();

   User.findOne({'username': form.login.toLowerCase()}, function(err, user) {
        if(err) return promise.fulfill(['Database error']);

        if(user) return promise.fulfill(['User with that name already exists']);

        User.findOne({'email': form.email.toLowerCase()}, function(err, user) {
            if(err) return promise.fulfill(['Database error 2']);

            if(!user) {
                if (!form.password) return promise.fulfill(['Password is required']);
                return promise.fulfill([]);
            }
            return promise.fulfill(['User with that email already exits']);
        });
        
        return promise;
   });  
    
   return promise;
} 

exports.registerUser = function registerUser(form) {
   var promise = this.Promise();
   bcrypt.gen_salt(10, function(err, salt) {
      if(err) return promise.fulfill(['Error generating salt']);
      bcrypt.encrypt(form.password,salt,function(err, hash) {
          var user = new User({
             'is_admin': false,
             'username': form.login.toLowerCase(),
             'password': hash,
             'email': form.email.toLowerCase(),
             name: {
                first: form.first_name.toLowerCase(),
                last: form.last_name.toLowerCase(),
             }, 
          });
          user.save(function(err) {
             if(err) {
                 return promise.fulfill(returnErrorList(err));
             } 
             return promise.fulfill(user);
          });
          return promise; 
      }); 
      return promise;
   }); 
   
   return promise;
}

exports.findUserById = function findUserById(userId, callback) {
    User.findById(userId, callback);
}

function returnErrorList(err){
    var errors = err.errors;
    var errList = []
    if (errors.username){
        if (errors.username.type === 'required') errList.push('Username is required');
        else errList.push('Username error');   
    }
    if (errors.email){
        if (errors.email.type === 'required') errList.push('Email is required');
        else errList.push('Email is not valid');
    }
    return errList;
}
