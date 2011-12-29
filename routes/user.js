/*
 * user.js
 *   Render user pages
 */
var mongoose = require('mongoose');
var models = mongoose.models;

/*
 * GET request for user profile
 */
exports.view = function(req, res, next) {
    models.User.findOne({username: req.params.username}, function(err, user) {
        if(err) return next(err);
        if(!user) return res.send('User Doesn\'t exist', 404);
        res.render('user', {
            'this_user': user,
        });
    });
}


/*
 * GET request for editing a profile
 */
exports.edit = function(req, res, next) {


}


/*
 * POST request for updating a profile
 */
exports.update = function(req, res, next) {


}
