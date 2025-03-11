from flask import request, jsonify, Flask
from flask_cors import CORS, cross_origin
import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/upload_sans": {"origins": ["https://uem-hackathon.vercel.app", "http://localhost:5173"]}})
app.config['CORS_HEADERS'] = 'Content-Type'

# Initialize a counter for filenames
upload_counter = 0

# Hugging Face API configuration
API_URL = "https://api-inference.huggingface.co/models/Tarakki100/sanskrit"
HF_ACCESS_TOKEN = os.getenv("HF_ACCESS_TOKEN")  # Load token from environment variable
headers = {"Authorization": f"Bearer {HF_ACCESS_TOKEN}"}

@cross_origin()
@app.route('/upload_sans', methods=['POST'])
def upload_audio():
    global upload_counter  
    audio_file = request.files.get('audio_data')

    if not audio_file:
        return jsonify({'error': 'No audio file received!'}), 400

    filename = f"recorded_audio_{upload_counter}.wav"
    folder_path = os.path.join(app.root_path, "sanskrit_recordings")
    os.makedirs(folder_path, exist_ok=True)
    audio_path = os.path.join(folder_path, filename)

    # Save the audio file
    audio_file.save(audio_path)
    upload_counter += 1

    # Send request to Hugging Face API
    with open(audio_path, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)

    # Remove the audio file after processing
    os.remove(audio_path)

    return response.json()


# # Hindi Model (Updated but still commented)
# API_URL_hindi = "https://api-inference.huggingface.co/models/vasista22/whisper-hindi-small"
# headers_hindi = {"Authorization": f"Bearer {HF_ACCESS_TOKEN}"}
# 
# @cross_origin()
# @app.route('/process_hindi', methods=['POST'])
# def process_hindi():
#     try:
#         audio_file = request.files.get('audio_data')
#         if not audio_file:
#             return jsonify({'error': 'No audio file received!'}), 400
#         
#         filename = "recorded_audio_hindi.wav"
#         folder_path = os.path.join(app.root_path, "hindi_recordings")
#         os.makedirs(folder_path, exist_ok=True)
#         audio_path = os.path.join(folder_path, filename)
#         
#         audio_file.save(audio_path)
#         with open(audio_path, "rb") as f:
#             data = f.read()
#         response = requests.post(API_URL_hindi, headers=headers_hindi, data=data)
#         
#         os.remove(audio_path)
#         return response.json()
#     except Exception as e:
#         return jsonify({'error': str(e)})


# # Gujarati Model (Updated but still commented)
# API_URL_gujarati = "https://api-inference.huggingface.co/models/vasista22/whisper-gujarati-small"
# headers_gujarati = {"Authorization": f"Bearer {HF_ACCESS_TOKEN}"}
# 
# @cross_origin()
# @app.route('/process_gujarati', methods=['POST'])
# def process_gujarati():
#     try:
#         audio_file = request.files.get('audio_data')
#         if not audio_file:
#             return jsonify({'error': 'No audio file received!'}), 400
#         
#         filename = "recorded_audio_gujarati.wav"
#         folder_path = os.path.join(app.root_path, "gujarati_recordings")
#         os.makedirs(folder_path, exist_ok=True)
#         audio_path = os.path.join(folder_path, filename)
#         
#         audio_file.save(audio_path)
#         with open(audio_path, "rb") as f:
#             data = f.read()
#         response = requests.post(API_URL_gujarati, headers=headers_gujarati, data=data)
#         
#         os.remove(audio_path)
#         return response.json()
#     except Exception as e:
#         return jsonify({'error': str(e)})


# # English Model (Updated but still commented)
# API_URL_english = "https://api-inference.huggingface.co/models/NeuralNovel/whisper-small-hi"
# headers_english = {"Authorization": f"Bearer {HF_ACCESS_TOKEN}"}
# 
# @cross_origin()
# @app.route('/process_english', methods=['POST'])
# def process_english():
#     try:
#         audio_file = request.files.get('audio_data')
#         if not audio_file:
#             return jsonify({'error': 'No audio file received!'}), 400
#         
#         filename = "recorded_audio_english.wav"
#         folder_path = os.path.join(app.root_path, "english_recordings")
#         os.makedirs(folder_path, exist_ok=True)
#         audio_path = os.path.join(folder_path, filename)
#         
#         audio_file.save(audio_path)
#         with open(audio_path, "rb") as f:
#             data = f.read()
#         response = requests.post(API_URL_english, headers=headers_english, data=data)
#         
#         os.remove(audio_path)
#         return response.json()
#     except Exception as e:
#         return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
