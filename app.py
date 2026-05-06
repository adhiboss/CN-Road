import os
import time
import random
import sqlite3
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
# Allow cross-origin requests so the frontend can talk to the backend
CORS(app) 

UPLOAD_FOLDER = 'uploads'
DB_FILE = 'database.sqlite'

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize SQLite Database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Table for storing uploaded images
    c.execute('''
        CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Table for storing AI inference logs
    c.execute('''
        CREATE TABLE IF NOT EXISTS inference_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_id INTEGER,
            model_used TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            is_accident BOOLEAN NOT NULL,
            log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (image_id) REFERENCES uploads (id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'images' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
    
    files = request.files.getlist('images')
    uploaded_files = []
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    for file in files:
        if file.filename == '':
            continue
            
        filename = secure_filename(file.filename)
        # Prepend timestamp to avoid overwriting existing files
        safe_filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
        
        # Save physical file
        file.save(filepath)
        
        # Save to database
        c.execute('INSERT INTO uploads (filename, filepath) VALUES (?, ?)', (safe_filename, filepath))
        file_id = c.lastrowid
        
        uploaded_files.append({
            'id': file_id,
            'filename': safe_filename,
            'filepath': filepath
        })
        
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'success', 'files': uploaded_files})


@app.route('/process', methods=['POST'])
def process_images():
    data = request.json
    if not data or 'image_ids' not in data or 'model' not in data:
        return jsonify({'status': 'error', 'message': 'Missing image_ids or model'}), 400
        
    image_ids = data['image_ids']
    model_name = data['model']
    
    results = []
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    for image_id in image_ids:
        # SIMULATION: 70% chance of detecting an accident for demo purposes
        is_accident = random.random() > 0.3
        confidence = random.randint(85, 99)
        
        # Log the inference result
        c.execute('INSERT INTO inference_logs (image_id, model_used, confidence, is_accident) VALUES (?, ?, ?, ?)',
                  (image_id, model_name, confidence, is_accident))
                  
        # Generate random coordinates for the bounding box
        width = random.randint(40, 80)
        height = random.randint(40, 80)
        top = random.randint(10, 90 - height)
        left = random.randint(10, 90 - width)
        
        results.append({
            'image_id': image_id,
            'is_accident': is_accident,
            'confidence': confidence,
            'box': {
                'width': width,
                'height': height,
                'top': top,
                'left': left
            }
        })
        
    conn.commit()
    conn.close()
    
    # Simulate the heavy processing time of a real AI model
    time.sleep(random.uniform(1.5, 3.0))
    
    return jsonify({'status': 'success', 'results': results})

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(debug=True, port=5000)
