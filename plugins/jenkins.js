(function(){
	const HOST = '172.16.154.50';
	
	var ws = new WebSocket('ws://' + HOST + ':8081/jenkins'),
		lines = {
			'test': [0, 'TESTING'],
			'test2': [1, 'DEVELOPMENT'],
			'test3': [2, 'PRODUCTION'],
			'test4': [3, 'RELEASE']
		},
		render = function(data){
			Board.rows[lines[data.project][0]].setChars(lines[data.project][1] + ' ' + data.result);
		};
	
	ws.onmessage = function(msg) {
		var data = JSON.parse(msg.data);
		
		Board.rows[lines[data.project][0]].setChars(lines[data.project][1] + ' ' + data.result);
	};
	
	_.each(lines, function(line, project){
		$.getJSON('http://' + HOST + ':8080/job/' + project + '/lastBuild/api/json', function(data){
			render({
				project: project,
				result: data.result
			});
		});
	});
})();