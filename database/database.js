var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'http://localhost:9200',
  log: 'trace'
});

module.exports.getStudentId = function(condition, fn) {
	client.search({
		index: 'papersubmit',
		_sourceExclude: ['password'],
  		body: {
    			query: {
      				match: condition
    			},
  		}
	}, function(error, response){
		fn(error, response);
	});
}

module.exports.addStudent = function(student, fn) {
	return client.index({
  		index: 'papersubmit',
  		type: 'student',
  		id: student.id,
  		body: {
    			name: student.name,
			password: student.password,
    			paperTitle: '',
    			paperUrl: '',
			paperScore: -1,
			paperStat: 'no submit',
			teacherId: ''
  			}
		}, function(error, response) {
			fn(error, response);
		});
}
module.exports.addTeacher = function(teacher, fn) {
	return client.index({
  		index: 'papersubmit',
  		type: 'teacher',
  		id: teacher.id,
  		body: {
    			name: teacher.name,
			password: teacher.password,
			studentList: [],
			finishList: [],
    			paperTitle: '',
    			paperUrl: '',
  			}
		}, function(error, response){
			fn (error, response);
		});
}
module.exports.submitpaper = function(studentId, url, fn) {
	return client.update({
  		index: 'papersubmit',
  		type: 'student',
  		id: studentId,
  		body: {
    			// put the partial document under the `doc` key
    			doc: {
      				paperUrl: url,
				paperStat: 'submitted'
    				}
  			}
		}, function(error, response){
			fn(error, response);
		});
}
module.exports.arrangeTeacherForStudent = function(studentId, teacherId, fn) {
	client.update({
  		index: 'papersubmit',
  		type: 'student',
  		id: studentId,
  		body: {
    		// put the partial document under the `doc` key
    		doc: {
      			teacherId: teacherId
    		}
  		}
	}, function (error, response) {
  		return client.update({
  			index: 'papersubmit',
  			type: 'teacher',
  			id: teacherId,
  			body: {
    				script: 'ctx._source.studentList.push(student)',// put the partial document under the `doc` key
				params: {
					student: studentId
				}
  			}
			}, function(error, resource){
				fn(response);
			});
	});
}
module.exports.score = function(studentId, score, fn) {
	return client.update({
  		index: 'papersubmit',
  		type: 'student',
  		id: studentId,
  		body: {
    			// put the partial document under the `doc` key
    			doc: {
      				paperScore: score,
				paperStat: "scored"
    				}
  			}
		}, function(error, response){
			fn(error, response);
		});
}
module.exports.getUserById = function(type, id, fn) {
	console.log(type+" "+id);
	client.get({
  		index: 'papersubmit',
  		type: type,
  		id: id,
		_sourceExclude: ['password']
		}, function(error, response){
			fn(error, response);
		});
}
module.exports.getPasswordById = function(type, id, fn) {
	return client.get({
  		index: 'papersubmit',
  		type: type,
  		id: id,
		_sourceInclude: ['password']
		}, function(error, response) {
			fn(error, response);
		});
}
module.exports.auth = function(password_input, password_set) {
	return password_input == password_set
}
module.exports.addFinish = function(studentId, teacherId) {
	return client.update({
  		index: 'papersubmit',
  		type: 'teacher',
  		id: teacherId,
  		body: {
			script:'ctx._source.finishList.push(student)',
			params: {
				student: studentId
			}
  		}
	}); 
}
//client.search({
//  index: 'books',
//  type: 'book',
//  body: {
//    query: {
//      multi_match: {
//        query: 'express js',
//        fields: ['title', 'description']
//      }
//    }
//  }
//}).then(function(response) {
//  var hits = response.hits.hits;
//}, function(error) {
//  console.trace(error.message);
//});
