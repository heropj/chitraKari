//to recieve events

const socket = io("http://localhost:3000");
// const socket = io("https://4m0cbtgg-3000.inc1.devtunnels.ms/");

// const roomId = prompt("Enter Room ID to join:");
const roomId=12345;
// const userName = prompt("Enter your name:");
if(roomId){
  console.log("sckt", socket)
    socket.emit("join-room", {roomId});
    document.getElementById("roomIdDisplay").style.visibility='visible';
    document.getElementById("roomId").innerText = `Room ID: ${roomId}`;
}

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
  document.getElementById('userNameDisplay').value = socket.id; //initially ye rakhenge sbpe
});

// Drawing event from other users
socket.on("draw", (data) => {

  console.log("draw data: ", data);
  if (data.userId === socket.id) return;

  ctx.strokeStyle = data.tool === "pen" ? data.color : bgColor;
  ctx.lineWidth = data.tool === "pen" ? data.size : data.size * 3;

  if (data.tool === "pen") {
    ctx.beginPath();
    ctx.moveTo(data.fromX, data.fromY);
    ctx.lineTo(data.toX, data.toY);
    ctx.stroke();
  } else if (data.tool === "eraser") {
    ctx.clearRect(
      data.toX - (data.size * 3) / 2,
      data.toY - (data.size * 3) / 2,
      data.size * 3,
      data.size * 3
    );
  }
});


//cursor show cro
let cursors = {}; //track other users' cursors

socket.on("ppcursor", (data) => {
    // console.log("pp cursor data: ", data);
  // if (data.userId === socket.id) return; //ignore self

  if (!cursors[data.userId]) {
    const newCursor = document.createElement("div");
    newCursor.classList.add("otherCursor");
    document.getElementById("cursorsContainer").appendChild(newCursor);
    cursors[data.userId] = newCursor;
  }

  const cursor = cursors[data.userId];

  cursor.style.left = `${data.x}px`;
  cursor.style.top = `${data.y}px`;

  const size = data.tool === "pen" ? data.brushSize : data.brushSize * 3;
  cursor.style.width = `${size}px`;
  cursor.style.height = `${size}px`;
  cursor.style.backgroundColor = data.tool === "pen" ? data.brushColor : bgColor;
  cursor.style.border = "1px solid #383636";
  cursor.style.borderRadius = data.tool === "pen" ? "50%" : "0";

  cursor.innerText = data.userName || "john doe";

});

socket.on("updateName", ({ userId, newName }) => {
  const cursor = cursors[userId];
  if (cursor) {
    // cursor.innerText = newName;
    cursor.textContent = newName;
  }
});

//jab disc hom uska cursr hata do
socket.on("user-disconnected", (userId) => {
  const cursor = cursors[userId];
  if (cursor) {
    cursor.remove();
    delete cursors[userId];
  }
});

