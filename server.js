const mediasoup = require('mediasoup');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const main = require("./route/main.js")
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname,'public')))
app.set("views",path.join(__dirname,"views"));
//get 메서드
app.use("/main",main);


let mediasoupWorker;
let router;

(async () => {
  // Create a mediasoup Worker
  mediasoupWorker = await mediasoup.createWorker();

  // Create a mediasoup Router
  router = await mediasoupWorker.createRouter({
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000
        }
      }
    ]
  });
  

  // Handle new WebSocket connections
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    // Handle client requests to create a new WebRTC transport
    socket.on('createWebRtcTransport', async (data, callback) => {
      const webRtcTransport_options = {
        listenIps: [ { ip:'127.0.0.1',  announcedIp:null } ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        }
      const transport  = await router.createWebRtcTransport(webRtcTransport_options);
      console.log('transport.id :'+ transport);
      callback({
        transportOptions: transport
      });
    });
  });
})();

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});