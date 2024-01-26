# Simulates a message queue. Not the best production build

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

notifications = []

@app.route('/api/notifications', methods=['POST', 'GET'])
def handle_notifications():
    if request.method == 'POST':
        # Parse JSON data from the request
        data = request.json
        title = data.get('title')
        body = data.get('body')
        notifications.append({'title': title, 'body': body})
        return jsonify({"success": True, "message": "Notification queued"}), 200
    elif request.method == 'GET':
        # Return the first notification in the queue
        if notifications:
            return jsonify(notifications.pop(0)), 200
        else:
            return jsonify({}), 204  

if __name__ == '__main__':
    app.run(debug=True, port=5000)