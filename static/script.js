const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const captureCanvas = document.createElement("canvas");
const captureContext = captureCanvas.getContext("2d");
const emotionText = document.getElementById("emotion");
const confidenceText = document.getElementById("confidence");
const statusText = document.getElementById("status");

video.setAttribute("playsinline", "true");

navigator.mediaDevices.getUserMedia({
    video: true
})
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
        };
    })
    .catch(() => {
        statusText.innerText = "Camera access denied";
    });

function resizeCanvas() {
    if (!video.videoWidth || !video.videoHeight) {
        return false;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    if (captureCanvas.width !== video.videoWidth || captureCanvas.height !== video.videoHeight) {
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
    }

    return true;
}

function drawOverlay(result) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const faces = result.faces || [];

    faces.forEach((face, index) => {
        const isPrimaryFace = index === 0;
        const lineWidth = isPrimaryFace ? 4 : 2;
        const strokeStyle = isPrimaryFace ? "#8b5cf6" : "rgba(255, 255, 255, 0.85)";
        const label = `${result.emotion} • ${result.confidence}%`;

        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.fillStyle = "rgba(15, 23, 42, 0.75)";
        context.beginPath();
        context.rect(face.x, face.y, face.w, face.h);
        context.stroke();

        if (isPrimaryFace) {
            context.font = "600 16px Arial";
            const labelWidth = context.measureText(label).width + 18;
            const labelX = face.x;
            const labelY = Math.max(30, face.y - 12);

            context.fillRect(labelX, labelY - 24, labelWidth, 28);
            context.fillStyle = "#ffffff";
            context.fillText(label, labelX + 9, labelY - 4);
        }
    });
}

async function sendFrame() {
    if (!resizeCanvas()) {
        return;
    }

    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    const image = captureCanvas.toDataURL("image/jpeg");

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: image
            })
        });

        const result = await response.json();

        emotionText.innerText = result.emotion || "Waiting...";
        confidenceText.innerText = result.faceDetected ? `${result.confidence}% confidence` : "Point the camera at a face";
        statusText.innerText = result.faceDetected ? "Face detected" : "No face detected";

        if (result.faceDetected) {
            drawOverlay(result);
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    } catch (error) {
        statusText.innerText = "Camera connection lost";
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

setInterval(sendFrame, 700);