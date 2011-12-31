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

/*
 * Sets all the routes
 *   Params: app
 */
exports.setRoutes = function(app) {
    app.get('/',index);
    
    app.get('/create-lesson', auth.requireLogin,lesson.create);
    app.post('/create-lesson', auth.requireLogin, lesson.save);

    app.get('/lessons', lesson.list);
    app.get('/lessons/rate', auth.requireLogin, lesson.rate);
    app.get('/lessons/request', auth.requireLogin, lesson.requestForm);
    app.post('/lessons/request', auth.requireLogin, lesson.sendRequest);
    app.get('/lessons/:id', lesson.page);
    app.post('/lessons', lesson.search);

    app.get('/user/edit-profile', auth.requireLogin, user.edit);
    app.post('/user/edit-profile', auth.requireLogin, user.update);
    app.get('/user/:username', user.view);   

    app.get('/requests', auth.requireLogin, request.list);
    app.get('/requests/action', auth.requireLogin, request.action);
};

/*
 * Home page
 */
function index(req, res){
    res.render('index');
}

