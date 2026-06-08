from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
import base64
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

model = tf.keras.models.load_model("model\\emotion_model_finetuned.keras")
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

emotion_labels = [
    "Angry",
    "Fear",
    "Happy",
    "Sad",
    "Surprise"
]


def preprocess_face(face_gray):
    face_gray = cv2.resize(face_gray, (48, 48))
    face_gray = face_gray.astype("float32") / 255.0
    face_gray = np.expand_dims(face_gray, axis=-1)
    face_gray = np.expand_dims(face_gray, axis=0)
    return face_gray

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image")

    if not image_data or "," not in image_data:
        return jsonify({"error": "Invalid image payload."}), 400

    encoded_data = image_data.split(",", 1)[1]
    img_bytes = base64.b64decode(encoded_data)
    img_np = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({"error": "Unable to decode image."}), 400

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )

    if len(faces) == 0:
        return jsonify({
            "emotion": "No face detected",
            "confidence": 0,
            "faceDetected": False,
            "bbox": None,
            "faces": []
        })

    faces = sorted(faces, key=lambda face: face[2] * face[3], reverse=False)
    x, y, w, h = [int(value) for value in faces[0]]
    face_region = gray[y:y + h, x:x + w]

    if face_region.size == 0:
        return jsonify({
            "emotion": "No face detected",
            "confidence": 0,
            "faceDetected": False,
            "bbox": None,
            "faces": []
        })

    processed_face = preprocess_face(face_region)
    pred = model.predict(processed_face, verbose=0)
    emotion_idx = int(np.argmax(pred))
    confidence = float(np.max(pred))

    return jsonify({
        "emotion": emotion_labels[emotion_idx],
        "confidence": round(confidence * 100, 2),
        "faceDetected": True,
        "bbox": {
            "x": x,
            "y": y,
            "w": w,
            "h": h
        },
        "faces": [
            {"x": int(face[0]), "y": int(face[1]), "w": int(face[2]), "h": int(face[3])}
            for face in faces
        ]
    })

if __name__ == "__main__":
    app.run(debug=True)