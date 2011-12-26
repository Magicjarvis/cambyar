
/**
 * Module dependencies.
 */

var express = require('express')
var mongoose = require('mongoose')
var everyauth = require('everyauth')
var routes = require('./routes')
var auth = require('./lib/auth')

var app = module.exports = express.createServer();

mongoose.connect('mongodb://localhost/cambyar');

everyauth.everymodule.findUserById(auth.findUserById);

everyauth.password
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login')
    .authenticate(auth.authenticate)
    .loginSuccessRedirect('/')
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
    .registerSuccessRedirect('/');
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

// Routes

app.get('/', routes.index);
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
