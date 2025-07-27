const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const customCursor = document.getElementById("customCursor");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let currentTool = "pen";
let brushColor = "#000000";
let brushSize = 4;
let bgColor = "#f0f0f0";

ctx.lineCap = "round";

let lastX = 0;
let lastY = 0;
let isNewStroke = false;


function drawFromSocket(data) {
  ctx.strokeStyle = data.tool === "pen" ? data.color : bgColor;
  ctx.lineWidth = data.tool === "pen" ? data.size : data.size * 2;

  ctx.beginPath();
  ctx.moveTo(data.fromX, data.fromY);
  ctx.lineTo(data.toX, data.toY);
  ctx.stroke();
}


document.getElementById("colorPicker").addEventListener("input", (e) => {
  brushColor = e.target.value;
  updateCustomCursorStyle();
});

document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = e.target.value;
  updateCustomCursorStyle();
});

document.getElementById("penBtn").addEventListener("click", () => {
  currentTool = "pen";
  updateCustomCursorStyle();
  updateToolBarIndicator();
});

document.getElementById("eraserBtn").addEventListener("click", () => {
  currentTool = "eraser";
  updateCustomCursorStyle();
  updateToolBarIndicator();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    downloadCanvasAsImage();
});

function downloadCanvasAsImage() {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  tempCtx.fillStyle = bgColor;
  tempCtx.fillRect(0, 0, canvas.width, canvas.height);

  tempCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = "chitrakari-drawing.png";
  link.href = tempCanvas.toDataURL();
  link.click();
}

let strokeBuffer = [];

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  isNewStroke = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
  strokeBuffer = [{ x: lastX, y: lastY }];
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top
  };
}

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const pos = getPos(e);
  isDrawing = true;
  isNewStroke = true;
  lastX = pos.x;
  lastY = pos.y;
  strokeBuffer = [{ x: lastX, y: lastY }];
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

function handleDrawing(x,y){
    if (isDrawing) {
      strokeBuffer.push({ x, y });

    if (currentTool === "pen") {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === "eraser") {
      let size = brushSize * 3;
      ctx.clearRect(x - size / 2, y - size / 2, size, size);
    }

    lastX = x;
    lastY = y;
    isNewStroke = false;
  }
}

canvas.addEventListener("mousemove", (e) => {
  
  customCursor.style.left = `${e.pageX}px`;
  customCursor.style.top = `${e.pageY}px`;
  customCursor.style.display = "block";

  socket.emit("ppcursor", {
    x: e.offsetX,
    y: e.offsetY,
    tool: currentTool,
    brushSize,
    brushColor,
    roomId: roomId,
    // userName: userName,
    userId: socket.id //to identify users uniquely(ye spelling sahi hai??)
  });

  handleDrawing(e.offsetX, e.offsetY);
});

canvas.addEventListener("touchmove", (e) => {

  e.preventDefault();
  const pos = getPos(e);

  customCursor.style.left = `${pos.x}px`;
  customCursor.style.top = `${pos.y}px`;
  customCursor.style.display = "block";

  socket.emit("ppcursor", {
    x: pos.x,
    y: pos.y,
    tool: currentTool,
    brushSize,
    brushColor,
    roomId: roomId,
    // userName: userName,
    userId: socket.id //to identify users uniquely(ye spelling sahi hai??)
  });

  handleDrawing(pos.x, pos.y);
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (strokeBuffer.length > 1) {
    socket.emit("draw", {
      points: strokeBuffer,
      color: brushColor,
      size: brushSize,
      tool: currentTool,
      roomId,
      userId: socket.id
    });
  }
  strokeBuffer = [];
});

canvas.addEventListener("touchend", () => {
    if (strokeBuffer.length > 1) {
    socket.emit("draw", {
      points: strokeBuffer,
      color: brushColor,
      size: brushSize,
      tool: currentTool,
      roomId,
      userId: socket.id
    });
  }
  strokeBuffer = [];
});

canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
  customCursor.style.display = "none"; // Hide custom cursor on mouse leave
});


//keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.key === "p" || e.key === "P") && e.altKey) {
      currentTool = "pen";
      updateCustomCursorStyle();
      updateToolBarIndicator();
  } else if ((e.key === "e" && e.altKey) || (e.key === "E" && e.altKey)) {
    currentTool = "eraser";
    updateCustomCursorStyle();
    updateToolBarIndicator();
  }
  else if((e.key=='S' && e.altKey) || (e.key=='s' && e.altKey)){
    downloadCanvasAsImage();
  }

});

//dekha react ka use bro..
function updateCustomCursorStyle() {
  if (currentTool === "pen") {
    customCursor.className = "pen";
    customCursor.style.width = `${brushSize}px`;
    customCursor.style.height = `${brushSize}px`;
    customCursor.style.backgroundColor = brushColor;
  } else {
    const size = brushSize * 3;
    customCursor.className = "eraser";
    customCursor.style.width = `${size}px`;
    customCursor.style.height = `${size}px`;
    customCursor.style.backgroundColor = bgColor;
  }
}
function updateToolBarIndicator() {
  if (currentTool === "pen") {
    document.getElementById("colorPicker").style.visibility = "visible";
    document.getElementById("penBtn").classList.add("ppactivebtn");
    document.getElementById("eraserBtn").classList.remove("ppactivebtn");

  } else {
    document.getElementById("colorPicker").style.visibility = "hidden";
    document.getElementById("eraserBtn").classList.add("ppactivebtn");
    document.getElementById("penBtn").classList.remove("ppactivebtn");
  }
}
updateCustomCursorStyle();


//send name update to server yaha se..
document.getElementById("userNameDisplay").addEventListener("input", (e) => {
  userName = e.target.value;
  socket.emit("nameChange", { userId: socket.id, newName: userName, roomId: roomId });
});