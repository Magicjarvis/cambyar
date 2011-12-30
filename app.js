/*
 * app.js
 *   The app itself
 */


/*
 * Module dependencies.
 */
var express = require('express');
var mongoose = require('mongoose');
var everyauth = require('everyauth');
var md5 = require('MD5');
var routes = require('./routes');
var auth = require('./lib/auth');

var app = module.exports = express.createServer();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/cambyar');



// Set up everyauth authentication and helpers

everyauth.everymodule.findUserById(auth.findUserById);

everyauth.password
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login')
    .authenticate(auth.authenticate)
    .loginLocals(function(req, res) {
        return { next: req.query.n };
    })
    .respondToLoginSucceed(auth.respondToLoginSucceed)
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register')
    .extractExtraRegistrationParams( function(req) {
        return {
            'email': req.body.email,
            'first_name': req.body.first_name,
            'last_name': req.body.last_name,
        };
    })
    .validateRegistration(auth.validateRegistration)
    .registerUser(auth.registerUser)
    .registerLocals(function (req, res) {
        return { next: req.query.n };
    })
    .respondToRegistrationSucceed(auth.respondToRegistrationSucceed);


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'TODO'}));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
});

everyauth.helpExpress(app);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Set up middleware to pass data to our views
app.dynamicHelpers({                                                             
    user: function(req, res) {                                                   
        return req.user;                                                         
    },                                                                           
    req: function(req, res) {                                                    
        return req;                                                              
    },
    email_hash: function(req, res) {
        var url = 'http://www.gravatar.com/avatar/';
        if(req.loggedIn) url+=md5(req.user.email);
        return url;
    },
    enc_url: function(req, res) {
        return encodeURIComponent(req.url);
    },
    flash: function(req, res) {
        return req.flash();     
    },
});  

// Set routes
routes.setRoutes(app);

// Start server!
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
