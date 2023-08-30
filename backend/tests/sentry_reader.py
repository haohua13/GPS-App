import pandas as pd
import threading
import os
import json
from datetime import datetime
import websocket
from gps_alarm import Vessel
import asyncio
import websockets
from data import Data
from websockets.sync.client import connect




SENTRY_IP = '172.17.86.72'
directory_to_save = os.path.join("C:\\", "Users", "haohu", "GPS-APP", "tests", "new_test_23_08")
os.makedirs(directory_to_save, exist_ok=True)

global gps_data

# initialize the Vessel class
my_vessel = Vessel(0)
# initialize the Data class to store GPS data
data_class = Data()

# reset the information in the Vessel class
def reset_and_run_algorithm():
    global my_vessel
    my_vessel = Vessel(0)  # Reset the algorithm
    
# gets message from Sentry webSocket
def on_message(ws, message):
    current_message = json.loads(message)
    # Can add more GPS data here
    # print(current_message)
    lat = current_message.get('boatbus', {}).get('lat')
    long = current_message.get('boatbus', {}).get('long')
    time = pd.to_datetime(current_message['boatbus_timestamp'], unit='ms')
    heading = current_message.get('boatbus', {}).get('heading')
    altitude = current_message.get('gnss', {}).get(7, {}).get('altitude')
    time = pd.to_datetime(current_message.get('gnss', {}).get(7, {}).get('timestamp'), unit='ms')
    gnss_method = current_message.get('gnss', {}).get(7, {}).get('gnss_method')
    n_satellites = current_message.get('gnss', {}).get(7,  {}).get('n_satellites')
    hdop = current_message.get('gnss', {}).get(7,  {}).get('hdop')
    pdop = current_message.get('gnss', {}).get(7,  {}).get('pdop')
    alarm_1 = False
    alarm_2 = False
    # reads message in real-time and runs algorithm
    anc1, anc2 = my_vessel.return_anchor_position()
    alarmStatus = my_vessel.return_alarm_status()
    if (anc1 !=0) and (anc2 !=0) and (alarmStatus == True):
        # run algorithm when "Set Alarm" is pressed
        alarm_1, alarm_2 = my_vessel.read_message(current_message)    

    # Save the message to a JSON file
    # Send GPS data to the frontend
    global gps_data
    GPS_data = {
        'lat': lat,
        'long': long,
        'time': time,
        'heading': heading,
        'alarm_1': alarm_1,
        'alarm_2': alarm_2,
        'altitude': altitude,
        'gnss_method': gnss_method,
        'n_satellites': n_satellites,
        'hdop': hdop,
        'pdop': pdop
    }
    data_class.update_gps_data(GPS_data)
    gps_data = data_class.get_gps_data()
    gps_data = json.dumps(gps_data) # convert to JSON format

    if (alarm_2 == True):
        print('Alarm 2')
        # stops algorithm when Alarm 2 is True
        reset_and_run_algorithm()
        exit()
    # Save the message to a JSON file
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

# sends the GPS data to the frontend app
async def handler(websocket, path):
    while True:
        global gps_data
        await websocket.send(gps_data)
        await websocket.send("GPS data server 2 (port 5001)")
        data = await websocket.recv()
        if (data.startswith('{"radius"')):
            real_data = json.loads(data)
            radius = real_data['radius']
            arcRadius = real_data['arcRadius']
            angleSwipe = real_data['angleSwipe']
            swipe = real_data['swipe']
            vessel_long = real_data['longitude']
            vessel_lat = real_data['latitude']
            my_vessel.define_anchor_area(vessel_long, vessel_lat, radius, arcRadius, swipe, angleSwipe)
        if (data.startswith('"{alarm"')):
            real_data = json.loads(data)
            my_vessel.alarm(real_data['alarmStatus'])


start_server = websockets.serve(handler, "localhost", 5001)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    handle_real_time_data()

    



