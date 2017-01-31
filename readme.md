# binary-streaming
Sending binary file to other client reailtime via streaming server, without saving into server.


## File Exchange via WEB
In web environment, users can't exchange their file via Web. Only option is one user uploads the file into server, and then others download it.
This means, first, server need to save the file into the disk, and then client also wait until file is uploaded.

WebRTC is real P2P connection between clients(peers), but still needs a server for signaling, and you need I.C.E. server also, and that is the point that web developers gave up the using WebRTC.
So I thought that what if the server is not saving the content from client, just send to another client directly?

And this is it. This example is just demonstration, so code is not clean, has not good architecture(you will see what it means in the code).
But it's actually working, and I tested with slowest AWS EC2, t1.nano, yes it was too slow, but it worked without any error, cross network.

The idea is simple, server receiving the chunk of binary data(ArrayBuffer) from client, and broadcast to all users in same channel.
Server just let stream go to the clients directly, not it's own memory or disk.

This has 2 good things:
1. User that want to get the file from another user don't need to wait until file is uploaded server. It just got the data realtime.
2. Server doesn't need to save file. Means save more resources.

In client, only to do is receiving chunks from server, and just combine them into single binary file and download itself(thanks to HTML5 URL and Blob!).


## How to run?
```bash
$ npm install
$ node server
```

Open the browser, and connect to localhost:3333.
If you want to test in actual public server, you must change the WebSocket url to your domain, else it won't work.
I used [EvSocket](https://www.npmjs.com/package/evsocket), it's a abstracted event driven interface WebSocket module made by me.
If you are familiar with Socket.io, you will easily get use to it, it's really easy.
EvSocket also supports Binary Transmission, so that's how file transfering is working in this example.
I will made a plugin for EvSocket that uploads file later, but now, I just implemented directly in client side.


# binary-streaming
서버를 활용한 클라이언트간 실시간 파일 공유, 서버에 파일을 저장하지 않습니다.

## 웹에서 파일 교환하기
웹에서 사용자끼리 파일을 주고받으려면 먼저 한 사용자가 서버에 파일을 업로드하고, 다른 사용자가 이를 내려받는 것 입니다.
이는 서버에 파일이 먼저 저장이 되어야 하고, 클라이언트는 업로드가 끝날때까지 기다려야함을 의미하죠.

WebRTC는 클라이언트(피어)간 실시간 P2P 통신이 가능하게 해주었지만 여전히 시그널링을 위한 서버가 필요하고, 실제로는 I.C.E. 서버까지 있어야 합니다. 그리고 여기서 많은 웹 개발자들이 WebRTC를 포기하죠!

따라서 만들었습니다. 이 예제는 그냥 동작하는지를 시연하기 위한 목적이므로 코드가 지저분하고 아키텍쳐도 엉망입니다(주석보시면 아실듯).
하지만 어쨌든 잘 돌아가고, 아마존에서 가장 느린 EC2인 t1.nano에서도 문제없이 잘 돌아가는 것을 확인했습니다.

아이디어는 정말 간단한데, 서버가 청크를 받으면 같은 채널에 모든 사용자한테 바로 브로드캐스팅하는것 입니다.
서버는 스트림을 그냥 클라이언트로 바로 흘려보낼뿐, 어디에도 데이터를 기록하지 않습니다.

이는 2가지 이점을 지는데요:
1. 사용자가 다른 사용자가 서버에 파일을 업로드하는지 기다릴 필요없이 실시간으로 파일을 교환할 수 있다.
2. 서버가 파일을 저장할 필요가 없으므로 리소스가 절약된다.

클라이언트가 할 일은 그냥 서버에서 전달된 청크를 하나의 바이너리로 합쳐서 스스로 다운받는것 뿐 입니다.


## 실행
```bash
$ npm install
$ node server
```

브라우저를 열고 localhost:3333에 연결합니다.
퍼블릭 서버에서 동작을 테스트하시려면 반드시 WebSocket URL을 해당 도메인으로 바꿔주셔야 합니다. 안그러면 웹소켓이 안돌아가요.
내부적으로 [EvSocket](https://www.npmjs.com/package/evsocket) 모듈을 사용했는데, 이는 추상화된 이벤트 기반 웹 소켓 모듈로, 제가 만든 모듈입니다.
Socket.io를 써보신적이 있으시면 어렵지 않게 쓰실 수 있습니다.
EvSocket은 바이너리 통신을 지원하기 때문에 이 예제가 동작할 수 있습니다.
언젠가 나중에 EvSocket용 파일 전송 플러그인 모듈을 개발할거지만, 일단 지금은 그냥 클라이언트 코드에서 바로 구현해놨습니다.