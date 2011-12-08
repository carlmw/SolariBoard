(function(){
	const HOST = 'dev-hson-1';
	var ws = new WebSocket('ws://' + HOST + ':8082/jenkins'),
		output = JSON.parse(localStorage.getItem('messages'))||[],
		lines = {
			'fidodevelopment': 'FIDODEV',
			'fidotesting': 'FIDOTEST',
			'kerby-server': 'KERBY SVR'
		},
		render = function(data){
			if(!lines[data.project]) return;
			if(output.length === Board.rows.length){
				output.pop();
			}
			
			var projectNumber = ' #' + data.number,
				projectName = lines[data.project].substring(0, 14 - projectNumber.length);
			
			output.unshift(projectName.rpad(' ', 14 - projectNumber.length) + projectNumber + data.result[0]);
			
			Board.setMessage(output);
			localStorage.setItem('messages', JSON.stringify(output));
		};
	
	ws.onmessage = function(msg) {
		var data = JSON.parse(msg.data);
		
		render(data);
	};
	
	Board.bind('start', function(){
		Board.setMessage(output);
	});
})();