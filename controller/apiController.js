var client = require('../database/database');
var fs = require('fs');
module.exports.getSubmittedStudent = function(fn) {
	var condition = {
		paperStat:"submitted"
	}
	client.getStudentId(condition, function(error, response){
		var result = response.hits.hits;
		fn(result);
	});
}

module.exports.getStudentInfo = function(id, fn) {
	client.getUserById("student", id, function(error, response){
		var result = response._source;
		fn(result);
	});
}

module.exports.upload = function(id, path, fn) {
	module.exports.getStudentInfo(id, function(result) {
		if (result.paperUrl != "") {
			fs.unlinkSync(result.paperUrl);
		}
		client.submitpaper(id, path, function(error, response){
			fn(response);
		});
	});	
}

module.exports.submitScore = function(id, score, teacherId, fn) {
	client.score(id, score, function(error, response){
		client.arrangeTeacherForStudent(id, teacherId, function(result){
			fn(result)
		});
	});
}
