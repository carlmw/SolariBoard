(function(){
	const HOST = '172.16.154.50';
	
	var ws = new WebSocket('ws://' + HOST + ':8081/jenkins'),
		output = [],
		lines = {
			'test': [0, 'KERBY CLNT'],
			'test2': [1, 'KERBY SVR'],
			'test3': [2, 'FIDO DEV'],
			'test4': [3, 'ZONZA']
		},
		render = function(data){
			console.log(data);
			if(!lines[data.project]) return;
			if(output.length === Board.rows.length){
				output.pop();
			}
			
			var projectNumber = ' #' + data.number,
				projectName = lines[data.project][1].substring(0, 14 - projectNumber.length);
			
			output.unshift(projectName.rpad(' ', 14 - projectNumber.length) + projectNumber + data.result[0]);
			
			Board.setMessage(output);
		};
	
	ws.onmessage = function(msg) {
		var data = JSON.parse(msg.data);
		
		render(data);
	};
	
	_.each(lines, function(line, project){
		$.getJSON('http://' + HOST + ':8080/job/' + project + '/lastBuild/api/json', function(data){
			console.log(data)
			render({
				project: project,
				result: data.result,
				number: data.number
			});
		});
	});
})();