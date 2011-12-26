var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var models = require('./models');
var User = models.User;

exports.authenticate = function authenticate(login, password) {
    var promise = this.Promise();
    User.findOne({'username': login.toLowerCase()}, function(err, user) {
        
        if(err) return promise.fulfill(['Database error']);

        if(!user) return promise.fulfill(['No Such User']);
        console.log('The password is '+typeof user.password+'\n'+'The answer is '+ typeof password);
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

   console.log(JSON.stringify(form));
   User.findOne({'username': form.login.toLowerCase()}, function(err, user) {
        console.log(JSON.stringify(user));
        if(err) return promise.fulfill(['Database error']);

        if(user) return promise.fulfill(['User with that name already exists']);

        User.findOne({'email': form.email.toLowerCase()}, function(err, user) {
            if(err) return promise.fulfill(['Database error 2']);

            if(!user) {
                console.log('There was not a user');
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
   console.log('Okay, im definitely about to register this bitch');
   bcrypt.gen_salt(10, function(err, salt) {
      if(err) return promise.fulfill(['Error generating salt']);
      bcrypt.encrypt(form.password,salt,function(err, hash) {
          var user = new User({
             'is_admin': false,
             'username': form.login.toLowerCase(),
             'password': hash,
             'email': form.email.toLowerCase(),
          });
          user.save(function(err) {
             if(err) {
                console.log('there was a fucking error fucking fuck')
                return promise.fulfill(['Error saving user']);
             } 
             console.log('there was not an error saving');
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




