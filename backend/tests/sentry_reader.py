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
import numpy as np



SENTRY_IP = '172.17.86.71'
# SENTRY_IP = '192.168.1.191'
directory_to_save = os.path.join("C:\\", "Users", "haohu", "GPS-APP", "tests", "office")
os.makedirs(directory_to_save, exist_ok=True)
# initialize the Vessel class
my_vessel = Vessel(0)
# initialize the Data class to store GPS data
data_class = Data()

global gps_data
global alarm_1, alarm_2
alarm_1 = False
alarm_2 = False
number = '8'
# reset the information in the Vessel class
def reset_and_run_algorithm():
    global my_vessel
    my_vessel = Vessel(0)  # Reset the algorithm
    
# gets message from Sentry webSocket
def on_message(ws, message):
    current_message = json.loads(message)
    # print(current_message)
    # Can add more GPS data here
    lat = current_message.get('boatbus_full_unsync', {}).get('position', {}).get(number, {}).get('latitude')
    long = current_message.get('boatbus_full_unsync', {}).get('position', {}).get(number, {}).get('longitude')
    heading = current_message.get('boatbus_full_unsync', {}).get('heading', {}).get(number, {}).get('heading')
    heading = heading*180/np.pi # convert to degrees
    altitude = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('altitude')
    gnss_method = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('gnss_method')
    n_satellites = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('n_satelites')
    hdop = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('hdop')
    pdop = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('pdop')
    time = str(pd.to_datetime(current_message.get('boatbus_timestamp'), unit = 'ms'))
    # reads message in real-time and runs algorithm
    anc1, anc2 = my_vessel.return_anchor_position()
    alarmStatus = my_vessel.return_alarm_status()
    print(anc1, anc2)
    print('AlarmStatus: ', alarmStatus)
    if (anc1 !=0) and (anc2 !=0) and (alarmStatus == True):
        global alarm_1, alarm_2
        # run algorithm when "Set Alarm" is pressed
        alarm_1, alarm_2 = my_vessel.read_message(current_message)    
        print('Alarm 1: ', alarm_1, 'Alarm 2: ', alarm_2)
    # Save the message to a JSON file
    # Send GPS data to the frontend
    global gps_data
    gps_data = {
        'lat': lat,
        'long': long,
        'heading': heading,
        'alarm_1': alarm_1,
        'alarm_2': alarm_2,
        'altitude': altitude,
        'gnss_method': gnss_method,
        'n_satellites': n_satellites,
        'hdop': hdop,
        'pdop': pdop,
        'time': time
    }
    gps_data = json.dumps(gps_data) # convert to JSON format

    if (alarm_2 == True):
        print('BOTH ALARMS ARE TRUE')
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
        await asyncio.sleep(0.1)
        print(gps_data)
        data = await websocket.recv()
        if (data.startswith('{"radius"')):
            real_data = json.loads(data)
            radius = real_data['radius']
            arcRadius = real_data['arcRadius']
            angleSwipe = real_data['angleSwipe']
            swipe = real_data['swipe']
            vessel_long = real_data['longitude']
            vessel_lat = real_data['latitude']
            my_vessel.define_anchor_area(vessel_lat, vessel_long, radius, arcRadius, swipe, angleSwipe)
        if (data.startswith('"{alar"')):
            real_data = json.loads(data)
            my_vessel.alarm(real_data['alarmStatus'])
        await asyncio.sleep(0.1)
            
start_server = websockets.serve(handler, "localhost", 5001)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    handle_real_time_data()
    