var express = require('express');
var formidable = require('formidable');
var util = require('util');
var router = express.Router();
var client = require('../database/database');
var apiController = require('../controller/apiController');
/* GET home page. */
router.get('/', function(req, res) {
	res.redirect('login');
});

router.get('/logout', function(req, res){
	req.session.destroy(function(){
		res.redirect('/');
	});
});
router.get('/login', function(req, res){
	res.render('login');
});
router.get('/student', function(req, res) {
	if (req.session.user.identity === "student") {
		console.log('visit student index');
		res.render('student');
	} else
		res.redirect('/login');
});

router.get('/teacher', function(req, res) {
	if (req.session.user.identity === "teacher") {
		console.log('visit teacher index');
		res.render('teacher');
	}
	else
		res.redirect('/login');
});

router.post('/login', function(req, res){
	client.getPasswordById(req.body.identity, req.body.id, function(error, response) {
			if (response.found) {
				if (req.body.password === response._source.password) {
					req.session.user = {id:response._id, identity:req.body.identity};
					req.session.success = 'Authenticated as ' + response._id;
					console.log('authentication success');
					res.redirect('/'+req.body.identity);
				} else {
					console.log('password error');
					req.session.error = 'authentication failed!';
					res.redirect('/login');
				}
			} else {
				console.log('No Found!');
				req.session.error = 'Authentication failed, please check your '
					+ ' username and password.'
					+ '(use "sunji" and "sunji")';
				res.redirect('login');
			}
	});
});

router.get('/signup', function(req, res){
	res.render('signup');
});

router.post('/signup', function(req, res){
	var user = {
		name : req.body.name,
		password : req.body.password,
		id : req.body.id
	}
	if (req.body.identity === "student") {
		client.addStudent(user, function(error, response){
			if (response.created)
				res.redirect('login')
			else
				res.redirect('signup')
		});
	} else {
		client.addTeacher(user, function(error, response){
			if (response.created)
				res.redirect('login')
			else
				res.redirect('signup')
		});
	}
});

router.get('/teacher/getSubmittedStudent', function(req, res){
	if (req.session.user.identity === "teacher") {
		apiController.getSubmittedStudent(function(result){
			res.send(result);
		});
	} else {
		console.log("Authentication failed!");
		res.redirect("/login");
	}
});

router.get('/student/getStudentInfo', function(req, res){
	if (req.session.user.identity === "student") {
		apiController.getStudentInfo(req.session.user.id, function(result){
			res.send(result);
		});
	} else {
		console.log("Authentication failed!");
		res.redirect("/login");
	}
});

router.post('/student/upload', function(req, res){
	if (req.session.user.identity === "student") {
		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
		form.uploadDir = "./public";
		form.keepExtensions = true;
		
		form.parse(req, function(err, fields, files) {
			console.log("successful upload file "+files.files.name+" ,Storing as "+files.files.path);
			apiController.upload(req.session.user.id, files.files.path, function(result){
				res.redirect('/student');
			});
    		});
	} else {
		console.log("Authentication failed!");
		res.redirect("/login");
	}
});

router.post('/teacher/submitScore', function(req, res) {
	if (req.session.user.identity === "teacher") {
		console.log(req);
		if (req.body.check === 'on' && parseInt(req.body.score) <= 100 && parseInt(req.body.score) >= 0)
			apiController.submitScore(req.body.id, req.body.score, req.session.user.id, function(result){res.send('成绩提交成功')});
		else
			res.send('分数提交错误，请检查是否填写所有的区域，并且填写的分数符合要求');
	} else {
		res.redirect('/login');
	}
});

router.get('/student/getId', function(req, res) {
	if (req.session.user.identity === "student") {
		res.send(req.session.user.id);
	} else {
		res.redirect("/login");
	}
});
module.exports = router;
