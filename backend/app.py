# Simulates a message queue. Not the best production build
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import os

app = Flask(__name__)
CORS(app)

env_path = '.env.local'
load_dotenv(dotenv_path=env_path)

notifications = []
notifications_list = []

def send_message_to_external_endpoint(message):
    url = os.getenv("ENDPOINT_URL")
    headers = {
        'Content-Type': 'application/json',
    }
    auth = HTTPBasicAuth('apikey', os.getenv("API_KEY"))
    payload = {
        "input": {
            "message_type": "text",
            "text": message,
            "options": {
                "return_context": True
            }
        },
        "context": {
            "global": {
                "system": {
                    "session_start_time": "2024-02-13T07:22:10.847Z",
                    "turn_count": 2,
                    "timezone": "Asia/Singapore",
                },
            },
            "skills": {
                "main skill": {
                    "user_defined": {
                        "user_group": "staff"
                    },
                    "system": {}
                },
                "actions skill": {
                    "action_variables": {},
                    "skill_variables": {
                        "user_group": "staff",
                        "minimumconfidence": 10,
                        "query_text": message
                    },
                    "system": {}
                }
            }
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, auth=auth)
        response.raise_for_status()  
        return response.json()  
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return None


@app.route('/api/notifications', methods=['POST', 'GET'])
def handle_notifications():
    if request.method == 'POST':
        data = request.json
        title = data.get('title')
        body = data.get('body')
        date = data.get('date')
        notifications.append({'title': title, 'body': body, 'date': date})
        notifications_list.append({'title': title, 'body': body, 'date': date})
        return jsonify({"success": True, "message": "Notification queued"}), 200
    elif request.method == 'GET':
        if notifications:
            return jsonify(notifications.pop(0)), 200
        else:
            return jsonify({}), 204  
        
@app.route('/api/notificationslist', methods=['GET'])
def retrieve_notifications():
    if notifications_list:
        return jsonify(notifications_list), 200
    else:
        return jsonify({}), 204
    
@app.route('/articlesData')
def serve_json():
    return send_from_directory('', 'articlesData.json')

@app.route('/api/message', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    print(f"Sending message: {message}")

    try:
        response = send_message_to_external_endpoint(message)
        if response is None:
            raise ValueError("Failed to get a response from the external endpoint")

        print(f"Response from external endpoint: {response}")

        generic_responses = response.get('output', []).get('generic', [])

        return jsonify(generic_responses), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to process the message"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)