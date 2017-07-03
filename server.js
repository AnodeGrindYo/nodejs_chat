var http = require('http');
var fs = require('fs');
var colours = new Array(
				'red', 
				'maroon', 
				'yellow',
				'olive',
				'lime',
				'green',
				'aqua',
				'teal',
				'blue',
				'navy',
				'fuchsia',
				'purple');
var conversation = new Array();


// chargement du fichier index.html affiché au client
var server = http.createServer(function(req,res)
{
	fs.readFile('./index.html', 'utf-8', function(error, content)
	{
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(content);
	});
});

// chargement de socket.io
var io = require("socket.io").listen(server);

io.sockets.on('connection', function(socket)
{
	// messages à la connection d'un nouveau client
	console.log("nouveau client connecté");
	socket.emit('con_msg', 'bienvenue!');
	socket.emit('conv', conversation);
	socket.pseudo = '';

	socket.on('send_msg', function(msg)
	{
		/*console.log(socket.pseudo+" : "+msg);*/
		console.log(socket.pseudo+" : "+msg);
		if(socket.pseudo != '')
		{
			socket.msg = msg;
			socket.date = getDateNow();
			msgJSON = {"pseudo" : socket.pseudo, "colour" : socket.colour, "message" : socket.msg, "date" : socket.date};
			socket.emit('msg', msgJSON);
			socket.broadcast.emit('msg', msgJSON);
			conversation.push(msgJSON);
		}
		else
		{
			socket.emit('no_pseudo', 'saisissez d\'abord votre pseudo pour pouvoir poster un message !');
		}
	});

	socket.on('valid_pseudo', function(pseudo)
	{
		socket.pseudo = pseudo;
		socket.colour = colours[Math.floor(Math.random()*colours.length)];
		socket.emit('new_user_msg', '<span style="color:'+socket.colour+';">'+getDateNow()+socket.pseudo+" vient de se connecter. </span>");
		socket.broadcast.emit('new_user_msg', '<span style="color:'+socket.colour+';">'+getDateNow()+socket.pseudo+" vient de se connecter. </span>");
		console.log("nouvel utilisateur : "+socket.pseudo+"\ncouleur : "+socket.colour);
	});
});

server.listen(8080);
console.log("le server du chat est lancé.\nécoute du port 8080");

function getDateNow()
{
	var now = new Date();
	var dd = now.getDate();
	var mm = now.getMonth()+1; //January is 0!
	var yyyy = now.getFullYear();
	var hh = now.getHours();
	var min = now.getMinutes();
	var ss = now.getSeconds();

	if(dd<10) 
	{
	    dd='0'+dd;
	} 

	if(mm<10) 
	{
	    mm='0'+mm;
	}

	if (hh<10)
	{
		hh='0'+hh;
	}

	if (min<10)
	{
		min='0'+min;
	}

	if (ss<10)
	{
		ss='0'+ss;
	}

	now = dd+'/'+mm+'/'+yyyy+' '+hh+':'+min+':'+ss+' &nbsp;&nbsp;&nbsp;';
	return(now);
}