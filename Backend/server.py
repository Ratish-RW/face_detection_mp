from flask import Flask,request,jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from insightface.app import FaceAnalysis
import numpy as np
import cv2
import re
import base64

app = Flask(__name__)
CORS(app)

face_app = FaceAnalysis(name="buffalo_l")
face_app.prepare(ctx_id=-1,det_size=(640,640))

data = np.load("Embeddings/good_embeddings_test.npz",allow_pickle=True)
stored_embeddings = data["embeddings"]
stored_labels = data["labels"]

stored_embeddings = stored_embeddings / np.linalg.norm(stored_embeddings, axis=1, keepdims=True)

def search_face(query_img_path, threshold=0.4):
    img = cv2.imread(query_img_path)
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

        result = search_face(img_path)
        return jsonify({"status": "success","result": result}), 200
    except Exception as e:
        return jsonify({'status':'failure',"error":str(e)}), 401

if __name__ == "__main__":
    app.run(debug=True,port=5000,host='0.0.0.0')