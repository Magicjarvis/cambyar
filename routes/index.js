/*
 * index.js
 * Sets all the routes throug here
 */

var mongoose = require('mongoose');
var md5 = require('MD5');
var models = require('../lib/models');
var auth = require('../lib/auth');
var lesson = require('./lesson');
var user = require('./user');
var request = require('./request');
var search = require('./search');
/*
 * Sets all the routes
 *   Params: app
 */
exports.setRoutes = function(app) {
    app.get('/',index);
    
    app.get('/portal', auth.requireLogin, user.portal);
    app.get('/create-lesson', auth.requireLogin,lesson.create);
    app.post('/create-lesson', auth.requireLogin, lesson.save);

    app.get('/lessons/delete', auth.requireLogin, lesson.delete);
    app.get('/lessons/edit', auth.requireLogin, lesson.edit);
    app.post('/lessons/edit', auth.requireLogin, lesson.update);
    app.get('/lessons/rate', auth.requireLogin, lesson.rate);
    app.post('/lessons/rate', auth.requireLogin, lesson.sendRating);
    app.post('/lessons/request', auth.requireLogin, lesson.sendRequest);
    app.get('/lessons/:id', lesson.page);
    app.get('/unrated', auth.requireLogin, lesson.unrated);

    app.get('/search', search.search);
    
    app.get('/user/edit-profile', auth.requireLogin, user.edit);
    app.post('/user/edit-profile', auth.requireLogin, user.update);
    app.get('/user/:username', user.view);   

    app.get('/requested', auth.requireLogin, request.requestedLessons);
    app.get('/requests', auth.requireLogin, request.list);
    app.get('/requests/action', auth.requireLogin, request.action);
};

/*
 * Home page
 */
function index(req, res){
    res.render('index');
}

