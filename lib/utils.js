/* 
 * utils.js
 *   Utilities for Strings and more! 
 */

var email = require('mailer');
var md5 = require('MD5');
var conf = require('../conf');

/* 
 * Capitalize a string
 */
exports.capitalize = function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/*
 * Full name maker
 */
exports.nameFull = function nameFull(name){
    return this.capitalize(name.first) + ' ' + this.capitalize(name.last);
}

/*
 * Gravatar email maker
 */
exports.gravatarURL = function(email) {
    var url = 'http://www.gravatar.com/avatar/';
    url += md5(email);
    return url;
}

/*
 * Email wrapper
 */
exports.sendEmail = function(to_email, template, data) {
    email.send({
      host : "in.mailjet.com",
      port : "587",
      ssl: false,
      domain : "in.mailjet.com",
      to : to_email,
      from : "noreply@cambyar.com",
      subject : data.subject,
      template: template,
      data : data,
      authentication : "login",
      username : conf.email_username,
      password : conf.email_password,
    }, function(err, result){
        if(err){ console.log(err); }
    });
}

/*
 * Bayesian average
 */
exports.average = function(avgNum, avgRating, thisTotal, thisNum) {
    return (((avgNum * avgRating) + thisTotal) / (avgNum + thisNum));
}

/*
 * Email matcher regex
 */
exports.emailCheck = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/;
