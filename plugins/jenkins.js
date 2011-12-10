(function(){
	const HOST = 'dev-hson-1';
	const ZONZAHOST = 'dev-jen1';
	const CHARCOUNT = 20;
	var ws, ws2,
		output = JSON.parse(localStorage.getItem('messages'))||[],
		lines = {
			'fidodevelopment': 'FIDODEV',
			'fidotesting': 'FIDOTEST',
			'kerby-server': 'KERBYSVR',
			'kerby-fido-integration': 'KERBYFIDOINT',
			'Zonza': 'ZONZA',
			'ZonzaRest': 'ZONZAREST',
			'ZonzaSelenium': 'ZONZASELENIUM'
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
	
	var connect = function(){
	    
	    if(ws) ws.close();
	    if(ws2) ws2.close();
	    
	    ws = new WebSocket('ws://' + HOST + ':8082/jenkins'),
    	ws2 = new WebSocket('ws://' + ZONZAHOST + ':8081/jenkins');
    	    
        ws.onmessage = ws2.onmessage = function(msg) {
    		var data = JSON.parse(msg.data);

    		render(data);
    	};
	};
	
    connect();
	
	Board.bind('start', function(){
		Board.setMessage(output);
	});
})();