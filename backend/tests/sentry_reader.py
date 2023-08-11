from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send
import threading
import os
import json
from datetime import datetime
import websocket
from gps_alarm import Vessel
import asyncio
import websockets
from data import Data

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

SENTRY_IP = '172.17.86.72'
directory_to_save = os.path.join("C:\\", "Users", "haohu", "GPS-APP", "tests", "test1")
os.makedirs(directory_to_save, exist_ok=True)

# initialize the Vessel class
my_vessel = Vessel(0)
data_class = Data()

# reset the information in the Vessel class
def reset_and_run_algorithm():
    global my_vessel
    my_vessel = Vessel(0)  # Reset the algorithm with the updated information
    
# gets message from Sentry webSocket
def on_message(ws, message):
    current_message = json.loads(message)
    print(current_message)
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
    # Send GPS data to the frontend over socketio
    GPS_data = {
        'lat': lat,
        'long': long,
        'time': time,
        'heading': heading,
        'alarm_1': alarm_1,
        'alarm_2': alarm_2
    }
    websocket.send(json.dumps(GPS_data))

    if (alarm_2 == True):
        print('Alarm 2')
        reset_and_run_algorithm()
        exit()
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


# create handler for each connection
async def handler(websocket, path):
    while True:
        data = await websocket.recv()
        reply = f"User Data received as: {data}!"
        await websocket.send(reply)
        
start_server = websockets.serve(handler, "localhost", 5000)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever() 

if __name__ == "__main__":
    handle_real_time_data()
    



