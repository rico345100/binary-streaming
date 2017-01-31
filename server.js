"use strict";
const httpServ = require('http').createServer();
const express = require('express');
const app = express();
const evsocket = require('evsocket');

app.get('/', (req, res) => {
	return res.sendFile(__dirname + '/client/index.html');
});
app.get('/evsocket-client.js', (req, res) => {
	return res.sendFile(__dirname + '/node_modules/evsocket-client/evsocket-client.js');
});
app.get('/jquery.js', (req, res) => {
	return res.sendFile(__dirname + '/node_modules/jquery/dist/jquery.min.js');
});
app.get('/app.js', (req, res) => {
	return res.sendFile(__dirname + '/client/app.js');
});

const socketServ = evsocket.createServer({ server: httpServ });
const sockets = {};
let userList = [];

socketServ.on('connection', (socket) => {
	sockets[socket.id] = socket;
	userList.push(socket.id);

	socket.join('streaming');	// Join to streaming channel to broadcasting
	
	socket.broadcast('user-joined', {
		users: userList
	});

	socket.on('close', () => {
		delete sockets[socket.id];

		for(let i = 0; i < userList.length; i++) {
			if(userList[i] === socket.id) {
				userList.splice(i, 1);
				break;
			}
		}

		socket.broadcast('user-leaved', {
			users: userList
		});
	});

	socket.on('start', (data) => {
		socket.broadcast('start', data);
	});
	socket.on('streaming', (data) => {
		console.log('Got stream from client...');
		
		// Currently, EvSocket don't have Binary Broadcasting, so just loop and send!
		for(let id in sockets) {
			sockets[id].sendBinary('streaming', data);
		}
	});
	socket.on('complete', (data) => {
		socket.broadcast('complete');
	});
});

httpServ.on('request', app);
httpServ.listen(3333, () => {
	console.log('Server listens at port 3333.');
});