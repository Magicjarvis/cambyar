
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var md5 = require('MD5');
var models = require('../lib/models')
var User = models.User;

exports.index = function(req, res){
    var name = 'Gangsta';
    var email_hash = 'http://www.gravatar.com/avatar/';
    if(req.user) {
        name = req.user.username;
        email_hash+=md5(req.user.email);
    }
    console.log(JSON.stringify(req.user));
    res.render('index', {  
        'name': name,
        'loggedIn': req.loggedIn,
        'email_hash': email_hash,
    });
};
