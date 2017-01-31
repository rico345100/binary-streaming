"use strict";
const socket = new EvSocket('ws://localhost:3333');		// For testing not localhost, must specify the domain, else it won't work.
const userIdEl = $('#userid');
const userListEl = $('#userlist');
const formEl = $('#fileForm');
const fileEl = $('#file');
let isConnected = false;
let isStreaming = false;

function updateUserList(userList) {
	userListEl.empty();

	userList.map((userId) => {
		userListEl.append(`<li>${userId}</li>`);
	});
}

let recvBin = null;
let mimeType = '';
// awesome combining two buffers method:
// https://gist.github.com/72lions/4528834
function concatBuffers(buf1, buf2) {
	var tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);
	tmp.set(new Uint8Array(buf1), 0);
	tmp.set(new Uint8Array(buf2), buf1.byteLength);
	return tmp.buffer;
}

socket.on('open', () => {
	isConnected = true;

	userIdEl.text(socket.id);

	socket.on('close', () => {
		isConnected = false;
	});
	socket.on('user-joined', (data) => {
		console.log('user joined!');
		updateUserList(data.users);
	});
	socket.on('user-leaved', (data) => {
		console.log('user leaved!');
		updateUserList(data.users);
	});
	socket.on('start', (data) => {
		console.log('Tranmission started.', data);
		recvBin = new ArrayBuffer(0);
		mimeType = data.type
	});
	socket.on('streaming', (data) => {
		console.log('Got data chunk!');
		recvBin = concatBuffers(recvBin, data);
	});
	socket.on('complete', () => {
		console.log('Transmission is over.');
		console.log('Received: ' + recvBin.byteLength);

		var blob = new Blob([recvBin], {
			type: mimeType
		});
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		document.body.appendChild(a);
		a.target = '_blank';
		a.click();
	});
});

formEl.on('submit', (ev) => {
	ev.preventDefault();

	if(!isConnected) {
		return alert('You must connected to server!');
	}
	else if(isStreaming) {
		return alert('You are streaming now, you cannot upload multiple files at once!');
	}
	
	let files = fileEl.get(0).files;
	
	if(files.length <= 0) {
		return alert('No file to send!');
	}

	isStreaming = true;

	let file = files[0];
	let fileReader = new FileReader();
	
	fileReader.onloadend = () => {
		const chunkSize = 10240;
		let buffer = fileReader.result;
		let fileInfo = {
			name: file.name,
			size: file.size,
			chunkSize: chunkSize,
			sent: 0
		};
		let timer = null;

		socket.send('start', {
			type: file.type
		});
		
		const sendChunk = () => {
			if(fileInfo.sent >= buffer.byteLength) {
				clearInterval(timer);
				socket.send('complete');
				isStreaming = false;
				return alert('Streaming end.');
			}

			var chunk = buffer.slice(fileInfo.sent, fileInfo.sent + chunkSize);
			socket.sendBinary('streaming', chunk);

			fileInfo.sent += chunk.byteLength;
			console.log(`Sent ${fileInfo.sent}/${fileInfo.size}`);
		};

		// Prevent server is blow up, let's give some time for each transmission.
		// If you making something real production based on this, you'd better do something else, basically it's a bad idea.
		// Good approach is server keep requesting the data from client until it ends.
		// Don't worry, EvSocket will have some extra module for binary file transmission later.
		timer = setInterval(sendChunk, 10);
	};

	fileReader.readAsArrayBuffer(file);
});