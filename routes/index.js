/*
 * GET home page.
 */
var mongoose = require('mongoose');
var md5 = require('MD5');
var models = require('../lib/models');
var lesson = require('./lesson');
var User = models.User;

exports.setRoutes = function(app) {
    app.get('/',index);
    app.get('/create-lesson',lesson.create)
    app.post('/create-lesson',lesson.save)
};

function index(req, res){
    var name = 'Gangsta';
    var email_hash = 'http://www.gravatar.com/avatar/';
    if(req.user) {
        name = req.user.username;
        email_hash+=md5(req.user.email);
    }
    res.render('index', {  
        'name': name,
        'loggedIn': req.loggedIn,
        'email_hash': email_hash,
    });
}

