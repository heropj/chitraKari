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

// document.getElementById("downloadBtn").addEventListener("click", () => {
//   const link = document.createElement("a");
//   link.download = "chitrakari-drawing.png";
//   link.href = canvas.toDataURL();
//   link.click();
// });



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

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

// canvas.addEventListener("mousemove", (e) => {
//   if (!isDrawing) return;

//   ctx.strokeStyle = currentTool === "pen" ? brushColor : bgColor;
//   ctx.lineWidth = brushSize;

//   ctx.lineTo(e.offsetX, e.offsetY);
//   ctx.stroke();
// });

// canvas.addEventListener("mousemove", (e) => {
//   if (!isDrawing) return;

//   if (currentTool === "pen") {
//     ctx.strokeStyle = brushColor;
//     ctx.lineWidth = brushSize;
//     ctx.lineTo(e.offsetX, e.offsetY);
//     ctx.stroke();
//   } else if (currentTool === "eraser") {
//     ctx.clearRect(e.offsetX - brushSize * 2 / 2, e.offsetY - brushSize * 2 / 2, brushSize * 2, brushSize * 2);
//   }
// });

canvas.addEventListener("mousemove", (e) => {
  
    customCursor.style.left = `${e.pageX}px`;
    customCursor.style.top = `${e.pageY}px`;
    customCursor.style.display = "block";

    // if (!isDrawing) {
    //     updateCustomCursorStyle();
    //     customCursor.style.transform = "translate(-50%, -50%)";
    // }
    //why cmntd?: har mouse move pe cursor kyu update karna bro, update only when needed..

  if (isDrawing && currentTool === "pen") {
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (isDrawing && currentTool === "eraser") {
    let size = brushSize * 3;
    ctx.clearRect(e.offsetX - size / 2, e.offsetY - size / 2, size, size);
  }
});



canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
  customCursor.style.display = "none"; // Hide custom cursor on mouse leave
});


//keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") {
      currentTool = "pen";
      updateCustomCursorStyle();
      updateToolBarIndicator();
  } else if (e.key === "e" || e.key === "E") {
    currentTool = "eraser";
    updateCustomCursorStyle();
    updateToolBarIndicator();
  }
  else if((e.key=='S' && e.altKey) || (e.key=='s' && e.altKey)){
    downloadCanvasAsImage();
  }

});

//dekha react ka use bro..
//keydown se tool switch hua, but cursor change nahi hua..
//kyuki cursor change ka logic mousemove event me handle kara hai..
//to ab yaha bhi handle karna padega (repetition karna padega bc), 
//ya fir mousemove ko call kar de?

//best is, make a fun to update cursor style and call it whenever needed
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
//why called updateCustomCursorStyle but not updateToolBarIndicator?
//reply on comeback.
//hint: canvas: cursor:none;


//why separate functions bro??
//kyuki jab jab cursor change karna hai tab tab indicator change karna hai aisa zaruri nahi
