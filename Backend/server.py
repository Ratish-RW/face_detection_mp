from flask import Flask,request,jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from insightface.app import FaceAnalysis
from ultralytics import YOLOE
import numpy as np
import cv2
import re
import base64

app = Flask(__name__)
CORS(app)

model = YOLOE("Yoloe/yoloe-11l-seg.onnx")

face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=-1,det_size=(640,640))

data = np.load("Embeddings/good_embeddings_test.npz",allow_pickle=True)
stored_embeddings = data["embeddings"]
stored_labels = data["labels"]


def resized_image(img_path,target_size=320):
    img = cv2.imread(img_path)
    h, w = img.shape[:2]

    scale = target_size / max(h,w)
    new_w, new_h = int(w*scale), int(h*scale)

    resized = cv2.resize(img,(new_w,new_h),interpolation=cv2.INTER_AREA)

    canvas = np.ones((target_size,target_size,3),dtype=np.uint8)*255

    x_offset = (target_size - new_w) // 2
    y_offset = (target_size - new_h) // 2

    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
    return canvas

def remove_background(img):
    results = model(img,conf=0.5)[0]
    h,w,_ = img.shape
    black_bg = np.zeros((h,w,3),dtype=np.uint8)
    output = black_bg.copy()

    if results is not None and results.masks is not None:

        for mask, box in zip(results.masks.data, results.boxes):
            cls = int(box.cls[0].item())  # class id
            if cls == 0:  # class 0 = person
                mask = mask.cpu().numpy().astype(np.uint8) * 255
                mask = cv2.resize(mask, (w, h))  # resize to image
                mask_3c = cv2.merge([mask, mask, mask])

                person_only = cv2.bitwise_and(img, mask_3c)
                bg_only = cv2.bitwise_and(black_bg, 255 - mask_3c)
                output = cv2.add(person_only, bg_only)
        return output
    else:
        return None



def preprocess_image(img,target_brightness=140,target_contrast=55):
    ycrcb = cv2.cvtColor(img,cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)

    current_brightness = np.mean(y)
    current_contrast = np.std(y)

    alpha = target_contrast / (current_contrast + 1e-5)
    beta = target_brightness - alpha * current_brightness

    alpha = np.clip(alpha, 0.9, 1.3)
    beta = np.clip(beta, -25, 25)

    y_adj = cv2.convertScaleAbs(y,alpha=alpha,beta=beta)

    sharpen_kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    y_sharp = cv2.filter2D(y_adj, -1, sharpen_kernel)

    corrected = cv2.merge((y_sharp, cr, cb))
    final_bgr = cv2.cvtColor(corrected, cv2.COLOR_YCrCb2BGR)

    final_img = cv2.resize(final_bgr, (320,320))
    cv2.imwrite("Uploads/preprocessed_img.png",final_img)
    return final_img

def search_face(img, threshold=0.45):
    #img = cv2.imread(query_img_path)
    faces = face_app.get(img)

    if len(faces) == 0:
        return None, 0.0

    query_emb = faces[0].embedding
    query_emb = query_emb / np.linalg.norm(query_emb)   
    query_emb = query_emb.reshape(1, -1)

    sims = cosine_similarity(query_emb, stored_embeddings)[0]
    best_idx = np.argmax(sims)
    best_score = sims[best_idx]

    if best_score > threshold:
        return {**stored_labels[best_idx], "score": float(best_score)}
    else:
        return {'id':'NEW','confidence':float(best_score)}
    
def clean_json(data):
    clean = {}
    for k, v in data.items():
        if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
            clean[k] = None 
        elif isinstance(v, (np.integer, np.floating)):
            clean[k] = v.item()  
        else:
            clean[k] = v
    return clean


@app.route('/hello',methods=['GET'])
def hello():
    return jsonify({"message":"helloooo!"})

@app.route('/get-image',methods=['POST'])
def get_image():
    try:
        data = request.get_json()
        if "image" not in data:
            return jsonify({'status':'failure',"error": "No image provided"}), 400
        
        img_data = re.sub("^data:image/.+;base64,", "", data["image"])
        img_bytes = base64.b64decode(img_data)

        img_path = "Uploads/img.png"

        with open(img_path,"wb") as f:
            f.write(img_bytes)
            
        resized_img = resized_image(img_path)
        remove_bg_img = remove_background(resized_img)
        preprocessed_img = preprocess_image(remove_bg_img)

        result = search_face(preprocessed_img)
        result = clean_json(result)
        return jsonify({"status": "success","result": result}), 200
    except Exception as e:
        return jsonify({'status':'failure',"error":str(e)}), 401

if __name__ == "__main__":
    app.run(debug=True,port=5000,host='0.0.0.0')