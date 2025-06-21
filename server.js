const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
  console.log('사용자 접속');

  ws.on('message', (data) => {
    console.log('받은 메시지:', data.toString());

    // 모든 클라이언트에게 브로드캐스트
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data); // 그대로 전달 (JSON 형태)
      }
    });
  });
});
