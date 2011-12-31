/*
 * request.js
 *   Reqest routes
 */

var models = require('../lib/models');

/*
 * GET request on current request for user
 */
exports.list = function(req, res, next) {
    models.Request.find({to: req.user._id, status: 'pending'}, function(err, pending) {
        if (err) return next(err);
        models.Request.find({to: req.user._id, status: 'in_session'}, function(err, sessions) {
            if (err) return next(err);
            res.render('requests', {
                'in_session': sessions,
                'pending': pending,
            });
        });
    });
}


/*
 * GET request on request action
 */
exports.action = function(req, res, next) {
    switch (req.query.a) {
    case 'accept':
        accept(req, res, next);
        break;
    case 'remove':
        remove(req, res, next);
        break;
    case 'complete':
        complete(req, res, next);
        break;
    case 'stale':
        stale(req, res, next);
        break;
    default:
        res.redirect('/requests');
    }
}

/*
 * Remove request
 */
function remove(req, res, next) {
    models.Request.remove({_id: req.query.r, to: req.user._id}, function(err) {
        if (err) return next(err);
        res.redirect('/requests');
    });
}

/*
 * Accept request
 */
function accept(req, res, next) {
    models.Request.update({_id: req.query.r, to: req.user._id, status: 'pending'}, {
        status: 'in_session',
    }, function(err) {
        if (err) return next(err);
        res.redirect('/requests');
    });
}

/*
 * Complete request
 */
function complete(req, res, next) {
    models.Request.findOne({
        _id: req.query.r, 
        to: req.user._id, 
        status: 'in_session'
    }, function(err, request) {
        if (err) return next(err);
        if (!request) return res.redirect('/requests');
        request.status = 'complete';
        request.save(function(err) {
            if (err) return next(err);
            models.User.findById(request.from, function(err, user) {
                if (err) return next(err);
                if (!user) return res.redirect('/requests');
                utils.sendEmail(user.email, './public/email/rate.txt',{
                    username: user.username,
                    rate_url: 'localhost:3000/lesson/rate?l='+request.lesson,
                    edit_url: 'localhost:3000/edit-profile'
                });

            });
        });
    });
}

/*
 * State request
 */
function stale(req, res, next) {
    models.Request.update({_id: req.query.r, to: req.user._id, status: 'in_session'}, {
        status: 'stale',
    }, function(err) {
        if (err) return next(err);
        res.redirect('/requests');
    });
}
