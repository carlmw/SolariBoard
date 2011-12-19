(function(){
	const WSHOST = 'websockethost:port';
	const CHARCOUNT = 20;
	var ws, ws2,
		output = JSON.parse(localStorage.getItem('messages'))||[],
		lines = {
			'buildname': 'BUILDALIAS'
		},
		render = function(data){
			if(!lines[data.project]) return;
			if(output.length === Board.rows.length){
				output.pop();
			}
			
			var projectNumber = ' #' + data.number,
				projectName = lines[data.project].substring(0, CHARCOUNT - projectNumber.length);
			
			output.unshift(projectName.rpad(' ', CHARCOUNT - projectNumber.length) + projectNumber + data.result[0]);
			
			Board.setMessage(output);
			localStorage.setItem('messages', JSON.stringify(output));
		};
	
	var WebSocket = WebSocket||MozWebSocket,
	    connect = function(){
	    if(ws) ws.close();
	    
	    ws = new WebSocket('ws://' + HOST + '/jenkins'),
    	    
        ws.onmessage = function(msg) {
    		var data = JSON.parse(msg.data);

    		render(data);
    	};
    	
    	setInterval(function(){
    	    ws.send('ping');
    	}, 5000);
	};
	
    connect();
	
	Board.bind('start', function(){
		Board.setMessage(output);
	});
})();