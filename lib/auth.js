/*
 * auth.js
 *   Authenication functions
 */
var bcrypt = require('bcrypt');
var utils = require('./utils');
var models = require('./models');
var User = models.User;

/*
 * Authenticate a user
 *   Params: 
 *      login-     String
 *      password-  String
 */
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


/*
 * Validate registration information 
 *   Params:
 *      form- Object {
 *              login: String
 *              password: String
 *              email: String
 *            }
 */
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

/*
 * Register a validated user
 *   Assumes registration passed validation 
 *   Params:
 *      form- Object {
 *              login: String
 *              password: String
 *              email: String
 *            }
 */
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
             utils.sendEmail(user.email, './public/email/welcome.txt', {
                 subject: 'Welcome to Cambyar',
                 username: user.username
             }); 
             return promise.fulfill(user);
          });
          return promise; 
      }); 
      return promise;
   }); 
   
   return promise;
}

/*
 * Finds a user by Id,
 *   enables the use of req.user thanks to everyauth
 */
exports.findUserById = function findUserById(userId, callback) {
    User.findById(userId, function(err, user){
        models.Request.count({to: user._id, status: 'pending'}, function(err,num) {
            user.notifications = num;
            callback(err, user);
        });
    });
}


/* 
 * Creates a list of errors from an err object
 *   Params:
 *      err object
 *   Returns:
 *      A list of String errors
 */
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


/*
 * Middleware to check logged in status and redirect if not
 */
exports.requireLogin  = function(req, res, next) {
    if (req.loggedIn) {
        return next();
    }
    req.flash('context', 'You Must Be Logged In To Do This!');
    res.redirect('/login?n=' + (encodeURIComponent(req.header('Referer') || '/')));
}

/*
 * Redirects to previous page on login
 */
exports.respondToLoginSucceed = function(res, user, data) {
    if(!user) return;
    var next = data.req.body.next || '/'
    res.redirect(decodeURIComponent(next));
}

/*
 * Redirects to previous page on registration
 */
exports.respondToRegistrationSucceed = function(res, user, data) {
    if(!user) return;
    res.redirect('/portal');
}
