var mongoose = require('mongoose');
var models = mongoose.models;

exports.view = function(req, res, next) {
    models.User.findOne({username: req.params.username}, function(err, user) {
        if(err) return next(err);
        if(!user) return res.send('User Doesn\'t exist', 404);
        res.render('user', {
            'this_user': user,
        });
    });

}

exports.edit = function(req, res, next) {


}

exports.update = function(req, res, next) {

}


