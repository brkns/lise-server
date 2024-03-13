{/* <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
const socket = io(); */}
import * as mediasoupClient from "mediasoup-client";

console.log(mediasoupClient); 
let localStream;
let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');

async function start() {
  // Connect to the server and create a WebRTC transport
  const transport = await createWebRtcTransport();
  console.log('WebRTC transport created:', transport);

  // Get user media (webcam)
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  // Connect to the mediasoup server
  const { producer, consumer } = await connectToMediasoup(transport);

  // Play remote stream
  remoteVideo.srcObject = new MediaStream([consumer.track]);
}

async function createWebRtcTransport() {
  return new Promise((resolve, reject) => {
    socket.emit('createWebRtcTransport', {}, (data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.transportOptions);
      }
    });
  });
}

async function connectToMediasoup(transportOptions) {
  const device = new mediasoupClient.device();
  await device.load({ routerRtpCapabilities: transportOptions.routerRtpCapabilities });

  const sendTransport = device.createSendTransport(transportOptions);
  const recvTransport = device.createRecvTransport(transportOptions);

  // Handle errors
  sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
    socket.emit('connectSendTransport', { dtlsParameters }, callback);
  });

  recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
    socket.emit('connectRecvTransport', { dtlsParameters }, callback);
  });

  // Create a producer for sending media
  const producer = await sendTransport.produce({
    track: localStream.getVideoTracks()[0],
    codecOptions: {
      opusStereo: 1
    }
  });

  // Create a consumer for receiving media
  const consumer = await recvTransport.consume({
    producerId: producer.id,
    rtpCapabilities: device.rtpCapabilities
  });

  return { producer, consumer };
}

// Start the WebRTC connection when the button is clicked
document.getElementById('connectButton').addEventListener('click', start);