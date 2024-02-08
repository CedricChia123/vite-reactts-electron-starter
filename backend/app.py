# Simulates a message queue. Not the best production build

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

notifications = []
notifications_list = []

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)