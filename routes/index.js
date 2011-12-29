/*
 * index.js
 * Sets all the routes throug here
 */

var mongoose = require('mongoose');
var md5 = require('MD5');
var models = require('../lib/models');
var lesson = require('./lesson');
var user = require('./user');

/*
 * Sets all the routes
 *   Params: app
 */
exports.setRoutes = function(app) {
    app.get('/',index);
    
    app.get('/create-lesson',lesson.create);
    app.post('/create-lesson',lesson.save);

    app.get('/lessons', lesson.list);
    app.get('/lessons/request', lesson.requestForm);
    app.post('/lessons/request', lesson.sendRequest);
    app.get('/lessons/:id', lesson.page);
    app.post('/lessons', lesson.search);

    app.get('/user/:username', user.view);
};

/*
 * Home page
 */
function index(req, res){
    res.render('index');
}

