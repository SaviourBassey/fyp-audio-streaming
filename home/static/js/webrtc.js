const remoteAudioContainer = document.getElementById('remote_audio_container');
const startCallButton = document.getElementById('start_call');
const roomName = 'django'; // Add this line to get the room name from Django
var signalingWebSocket;
if (window.location.protocol == "https:"){
    signalingWebSocket = new WebSocket('wss://' + window.location.host + '/ws/signal/' + roomName + '/');
} else{
    signalingWebSocket = new WebSocket('wss://' + window.location.host + '/ws/signal/' + roomName + '/');
}
 

signalingWebSocket.addEventListener("open", (e) => {
    console.log("Connection Open");
});

let localStream;
const peerConnections = new Map();
const configuration = { 'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}] };

startCallButton.addEventListener('click', startCall);

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    signalingWebSocket.send(JSON.stringify({ 'type': 'join' }));
}

async function createPeerConnection(remoteId) {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections.set(remoteId, peerConnection);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            signalingWebSocket.send(JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate, 'to': remoteId }));
        }
    };

    peerConnection.ontrack = (event) => {
        let remoteAudio = document.getElementById('remote_audio_' + remoteId);
        if (!remoteAudio) {
            remoteAudio = document.createElement('audio');
            remoteAudio.setAttribute('id', 'remote_audio_' + remoteId);
            remoteAudio.setAttribute('autoplay', '');
            remoteAudioContainer.appendChild(remoteAudio); // Update this line
        }
        remoteAudio.srcObject = event.streams[0];
    };

    return peerConnection;
}

signalingWebSocket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const remoteId = data.from;
    let peerConnection;

    if (!peerConnections.has(remoteId)) {
        peerConnection = await createPeerConnection(remoteId);
    } else {
        peerConnection = peerConnections.get(remoteId);
    }

    if (data.type === 'join') {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingWebSocket.send(JSON.stringify({ 'type': 'offer', 'offer': offer, 'to': remoteId }));
    } else if (data.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingWebSocket.send(JSON.stringify({ 'type': 'answer', 'answer': answer, 'to': remoteId }));
    } else if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'candidate') {
        const candidate = new RTCIceCandidate(data.candidate);
        await peerConnection.addIceCandidate(candidate);
    }
};


const muteUnmuteButton = document.getElementById('mute_unmute_mic');
muteUnmuteButton.addEventListener('click', muteUnmuteMicrophone);

function muteUnmuteMicrophone() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
            const isMuted = audioTracks[0].enabled;
            audioTracks[0].enabled = !isMuted;
            muteUnmuteButton.innerText = isMuted ? 'Mute Microphone' : 'Unmute Microphone';
        }
    }
}








































// const remoteAudio = document.getElementById('remote_audio');
// var loc = window.location;
// // var wsStart = "ws://";
// // var endPoint = wsStart + loc.host + loc.pathname;
// const startCallButton = document.getElementById('start_call');
// // console.log(loc.host + loc.pathname)
// const signalingWebSocket = new WebSocket('ws://' + window.location.host + '/ws/signal/room1/');

// signalingWebSocket.addEventListener("open", (e) => {
//     console.log("Connection Open");

// });

// let localStream;
// let peerConnection;
// const configuration = { 'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}] };

// startCallButton.addEventListener('click', startCall);

// async function startCall() {
//     localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
//     peerConnection = new RTCPeerConnection(configuration);

//     localStream.getTracks().forEach(track => {
//         peerConnection.addTrack(track, localStream);
//     });

//     peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//             signalingWebSocket.send(JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }));
//         }
//     };

//     peerConnection.ontrack = (event) => {
//         remoteAudio.srcObject = event.streams[0];
//         remoteAudio.play();
//     };

//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     signalingWebSocket.send(JSON.stringify({ 'type': 'offer', 'offer': offer }));
// }


// signalingWebSocket.onmessage = async (event) => {
//     const data = JSON.parse(event.data);
//     if (data.type === 'offer') {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);

//         signalingWebSocket.send(JSON.stringify({ 'type': 'answer', 'answer': answer }));
//     } else if (data.type === 'answer') {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
//     } else if (data.type === 'candidate') {
//         const candidate = new RTCIceCandidate(data.candidate);
//         await peerConnection.addIceCandidate(candidate);
//     }
// };