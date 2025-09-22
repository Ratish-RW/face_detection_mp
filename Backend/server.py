from flask import Flask,request,jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from insightface.app import FaceAnalysis
from ultralytics import YOLOE
import numpy as np
import cv2
import re
import base64
import certifi
import os
from pymongo import MongoClient
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

username = os.getenv("MONGO_USERNAME")
password = quote_plus(os.getenv("MONGO_PASSWORD"))  
cluster_url = os.getenv("MONGO_CLUSTER_URL")
app_name = os.getenv("MONGO_APP_NAME")


client = MongoClient(
    f"mongodb+srv://{username}:{password}@{cluster_url}/?retryWrites=true&w=majority&appName={app_name}",
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["face_db"]
collection = db["faces"]
print("Connected to MongoDB successfully")

def load_embeddings_from_db():
    global stored_embeddings, stored_labels
    stored_embeddings = []
    stored_labels = []

    for document in collection.find({}):
        stored_embeddings.append(np.array(document['embedding']))
        stored_labels.append(document['info'])

    if stored_embeddings:
        stored_embeddings = np.stack(stored_embeddings)
    else:
        stored_embeddings = np.zeros((0,512))
    stored_labels = np.array(stored_labels)

load_embeddings_from_db()
print("Loaded Embeddings successfully")

app = Flask(__name__)
CORS(app)

model = YOLOE("Yoloe/yoloe-11l-seg.onnx")

face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=-1,det_size=(640,640))


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

def search_face(img, threshold=0.2, top_k=5):
    faces = face_app.get(img)

    if len(faces) == 0:
        return []

    # Get and normalize query embedding
    query_emb = faces[0].embedding
    query_emb = query_emb / np.linalg.norm(query_emb)
    query_emb = query_emb.reshape(1, -1)

    # Compute cosine similarity with stored embeddings
    sims = cosine_similarity(query_emb, stored_embeddings)[0]

    # Get top_k indices sorted by similarity (descending)
    top_indices = np.argsort(sims)[::-1][:top_k]

    results = []
    for idx in top_indices:
        score = sims[idx]
        if score > threshold:
            results.append({**stored_labels[idx], "score": float(score)})
    return results
    
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

def clean_json_list(data_list):
    cleaned_list = [clean_json(item) for item in data_list]
    return cleaned_list


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
        result = clean_json_list(result)
        return jsonify({"status": "success","result": result}), 200
    except Exception as e:
        return jsonify({'status':'failure',"error":str(e)}), 401
    
@app.route('/add-data',methods=['POST'])
def insert_data():
    try:
        data = request.get_json()
        name = data.get('name')
        nickname = data.get('nickname')
        age = data.get('age')
        police_station = data.get('police_station')
        crime_and_section = data.get('crime_and_section')
        head_of_crime = data.get('head_of_crime')
        arrested_date_time = data.get('arrested_date_time')
        img_url = data.get('img_url')

        print(name,nickname,age,police_station,crime_and_section,head_of_crime,arrested_date_time)

        if "image" not in img_url:
            return jsonify({'status':'failure',"error": "No image provided"}), 400
        
        img_data = re.sub("^data:image/.+;base64,", "", img_url)
        img_bytes = base64.b64decode(img_data)

        img_path = "Uploads/img.png"
        with open(img_path,"wb") as f:
            f.write(img_bytes)

        resized_img = resized_image(img_path)
        remove_bg_img = remove_background(resized_img)
        preprocessed_img = preprocess_image(remove_bg_img)

        faces = face_app.get(preprocessed_img)

        if len(faces) > 0:
            face_embedding = faces[0].embedding
            face_embedding = face_embedding / np.linalg.norm(face_embedding)

            person_info = {
                "Name": name,
                "Nickname": nickname,
                "Age": age,
                "Police Station": police_station,
                "Crime and section": crime_and_section,
                "Head of Crime": head_of_crime,
                "Arrested Date/Time": arrested_date_time,
                "img_url": img_url
            }

            doc = {
                "info": person_info if isinstance(person_info,dict) else {"label": str(person_info)},
                "embedding": face_embedding.tolist()
            }

            result = collection.insert_one(doc)
            #print(f"Inserted with _id={result.inserted_id}")
            load_embeddings_from_db()
            print("Refreshed embeddings successfully")
            return jsonify({'status':'success','message':'Face added successfully'}), 200
        
        else:
            return jsonify({'status':'failure', 'error':'No face found'}), 401
        

    except Exception as e:
        return jsonify({'status':'failure','error':str(e)}), 401

if __name__ == "__main__":
    app.run(debug=True,port=5000,host='0.0.0.0')