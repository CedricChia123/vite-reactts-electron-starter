# Simulates a message queue. Not the best production build
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ibm_watson import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv
import requests
from requests.auth import HTTPBasicAuth
import os
import json

app = Flask(__name__)
CORS(app)

env_path = '.env.local'
load_dotenv(dotenv_path=env_path)

notifications = []
notifications_list = []

authenticator = IAMAuthenticator(os.getenv("API_KEY"))
assistant = AssistantV2(
    version='2023-06-15',
    authenticator = authenticator
)

assistant.set_service_url(os.getenv("SERVICE_URL"))

response = assistant.create_session(
    assistant_id=os.getenv("ASSISTANT_ID")
).get_result()

session_id = response["session_id"]

global_state = ''

def send_message_to_external_endpoint(input_assistant, input_session_id, message):
    test_input = {
            "message_type": "text",
            "text": message,
            "options": {
                "return_context": True
            }
    }
    test_context = {
        "global": {
                "system": {
                    "session_start_time": "2024-02-13T07:22:10.847Z",
                    "turn_count": 2,
                    "timezone": "Asia/Singapore",
                    "state": global_state,
                    "user_id": input_session_id
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

    # payload = {
    #     "input": {
    #         "message_type": "text",
    #         "text": message,
    #         "options": {
    #             "return_context": True
    #         }
    #     },
    #     "context": {
    #         "global": {
    #             "system": {
    #                 "session_start_time": "2024-02-13T07:22:10.847Z",
    #                 "turn_count": 2,
    #                 "timezone": "Asia/Singapore",
    #             },
    #         },
    #         "skills": {
    #             "main skill": {
    #                 "user_defined": {
    #                     "user_group": "staff"
    #                 },
    #                 "system": {}
    #             },
    #             "actions skill": {
    #                 "action_variables": {},
    #                 "skill_variables": {
    #                     "user_group": "staff",
    #                     "minimumconfidence": 10,
    #                     "query_text": message
    #                 },
    #                 "system": {}
    #             }
    #         }
    #     }
    # }

    try:
        response = input_assistant.message(
            assistant_id=os.getenv("ASSISTANT_ID"),
            session_id=input_session_id,
            input=test_input,
            context = test_context
        ).get_result() 
        return response  
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
        response = send_message_to_external_endpoint(assistant, session_id, message)
        if response is None:
            raise ValueError("Failed to get a response from the external endpoint")

        print(f"Response from external endpoint: {response}")

        generic_responses = response.get('output', []).get('generic', [])

        global_state = response.get('context').get('global').get('system').get('state')

        print(global_state)

        return jsonify(generic_responses), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to process the message"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)