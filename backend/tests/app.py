from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import os
import json
from datetime import datetime
import websocket
from gps_alarm import Vessel

# create instance of Flask app
app = Flask(__name__)
# secret key for Flask app
app.config['SECRET_KEY'] = 'secret!'
# create instance of SocketIO to allow CORS for all origins '*'
socketio = SocketIO(app,cors_allowed_origins="*")



SENTRY_IP = '172.17.86.72'
directory_to_save = os.path.join("C:\\", "Users", "haohu", "GPS-APP", "tests", "test1")
os.makedirs(directory_to_save, exist_ok=True)

# initialize the Vessel class
my_vessel = Vessel(0)

# reset the information in the Vessel class
def reset_and_run_algorithm():
    global my_vessel
    my_vessel = Vessel(0)  # Reset the algorithm with the updated information


@socketio.on('connect')
def connected():
    print('Client connected')
    emit('connect',f"User {request.sid} connected",broadcast=True)

@socketio.on('data')
def handle_message(data):
    """event listener when client(user) sends a message to the server"""
    print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    print("user disconnected")
    emit("disconnect",f"user {request.sid} disconnected",broadcast=True)
    

# handles user data from React frontend
def handle_user_data(data):
    anchor_lat = data.get('latitude')
    anchor_long = data.get('longitude')
    radius = data.get('radius')
    arc_radius = data.get('arcRadius')
    swipe = data.get('swipe')
    angleswipe = data.get('angleSwipe')
    my_vessel.define_anchor_area(anchor_lat, anchor_long, radius, arc_radius, swipe, angleswipe)
    print(f'Anchor Area Parameters Updated: {anchor_lat}, {anchor_long}, {radius}, {arc_radius}, {swipe}, {angleswipe}')

# get user data from React frontend
@socketio.on('user_data')
def handle_user_data_from_frontend(data):
    # Keep updating the user information
    handle_user_data(data)

# gets message from Sentry webSocket and sends it to React frontend
def on_message(ws, message):
    current_message = json.loads(message)
    lat = current_message.get('boatbus', {}).get('lat')
    long = current_message.get('boatbus', {}).get('long')
    time = current_message.get('boatbus_timestamp')
    heading = current_message.get('boatbus', {}).get('heading')
    alarm_1 = False
    alarm_2 = False
    # reads message in real-time and process it
    anc1, anc2 = my_vessel.return_anchor_position()
    if (anc1 !=0) and (anc2 !=0):
        alarm_1, alarm_2 = my_vessel.read_message(current_message)    
    # Save the message to a JSON file
    # Send GPS data to the frontend over WebSocket
    socketio.emit('gps_data', {'lat': lat, 'long': long, 'time': time, 'heading': heading, 'alarm_1': alarm_1, 'alarm_2': alarm_2})
    if (alarm_2 == True):
        print('Alarm 2')
        reset_and_run_algorithm()
    with open(os.path.join(directory_to_save, '{}.json'.format(datetime.timestamp(datetime.now()))), 'w') as fp:
        fp.write(message)
    

def on_error(ws, error):
    print(error)

def on_close(ws, banana, asd):
    print("### closed ###")
    
def on_open(ws):
    pass

def handle_real_time_data():
    websocket.enableTrace(False)
    ws = websocket.WebSocketApp("ws://{sentry_ip}:9002/v1/sentrydatasource".format(sentry_ip=SENTRY_IP),
                                on_open=on_open,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()

# Start the WebSocket handling in a separate thread
data_thread = threading.Thread(target=handle_real_time_data)
data_thread.daemon = True
data_thread.start()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    socketio.run(app, debug=True, port = 5000)