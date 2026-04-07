console.log("Classroom JS loaded");

const entryPanel = document.getElementById("entry-panel");
const room = document.getElementById("room");

const roomTitle = document.getElementById("roomTitle");
const roomName = document.getElementById("roomName");
const roomCodeLabel = document.getElementById("roomCode");

const joinCode = document.getElementById("joinCode");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const startCamBtn = document.getElementById("startCamBtn");

const chatBox = document.getElementById("chatBox");
const sendMsgBtn = document.getElementById("sendMsgBtn");
const chatMsg = document.getElementById("chatMsg");

let localStream = null;

// CREATE ROOM
document.getElementById("createBtn").onclick = () => {
    const title = roomTitle.value.trim();
    if (!title) return alert("Enter a classroom title");

    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    openRoom(title, code);
};

// JOIN ROOM
document.getElementById("joinBtn").onclick = () => {
    const code = joinCode.value.trim().toUpperCase();
    if (!code) return alert("Enter valid code");

    openRoom("Joined Classroom", code);
};

// SHOW ROOM UI
function openRoom(title, code) {
    entryPanel.style.display = "none";
    room.style.display = "block";
    roomName.textContent = title;
    roomCodeLabel.textContent = code;
}

// START CAMERA
startCamBtn.onclick = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        localVideo.srcObject = localStream;
    } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera");
    }
};

// CHAT SYSTEM
sendMsgBtn.onclick = () => {
    const message = chatMsg.value.trim();
    if (!message) return;

    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = message;

    chatBox.appendChild(div);
    chatMsg.value = "";
};
