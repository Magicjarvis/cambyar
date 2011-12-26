
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var models = require('../lib/models')
var User = models.User;

exports.index = function(req, res){
    var name = 'Gangsta';
    if(req.user) name = req.user.username;
    console.log(JSON.stringify(req.user));
    res.render('index', {  
        'name': name,
        'loggedIn': req.loggedIn,
    });
};
