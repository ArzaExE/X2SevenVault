from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("best.pt")

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    results = model(image)[0]
    
    detections = []
    for box in results.boxes:
        detections.append({
            "label": results.names[int(box.cls)],
            "confidence": float(box.conf),
            "box": {
                "x1": float(box.xyxyn[0][0]),
                "y1": float(box.xyxyn[0][1]),
                "x2": float(box.xyxyn[0][2]),
                "y2": float(box.xyxyn[0][3]),
            }
        })
    
    return { "detections": detections }