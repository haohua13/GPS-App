import pandas as pd
import math
from math import radians, cos, sin, asin, sqrt, atan2, degrees
from geopy.distance import Geodesic


class Vessel():

    def __init__(self, id):
        self.id = id
        self.message = 0
        self.roll = 0
        self.pitch = 0
        self.yaw = 0
        self.messageID = 0
        self.boatbus_timestamp = 0
        self.lat = 0
        self.long = 0
        self.heading = 0
        self.radius_earth = 6378.1*1000 # radius of earth in meters

        self.initial_lat = 0
        self.initial_long = 0

        # If User gives Depth+Chain+Length, then calculate radius
        self.radius_recommended = 0

        # Parameters for anchorage mode
        self.anchor_lat = 0
        self.anchor_long = 0
        self.radius = 0
        self.arc_radius = 0
        self.azimuth = 0
        self.swipe = 0
        self.angleswipe = 0
        self.alarm_status = False

        # Parameters for GPS alarm
        self.anchor_distance = 0
        self.bound_counter = 0
        self.disconnect_counter = 0
        self.position = 0
        self.current_time = 0
        self.prev_time = 0
        self.position_distance = 0
        self.prev_lat = 0
        self.prev_long = 0
        self.position_counter = 0
        self.bound_counter_lv1 = 0
        self.alarm_lv1 = False
        self.alarm_lv2 = False
        self.hdop = 0 
        self.pdop = 0
        self.gnss_method = 1
        self.alarm_status = False

        # User Defined Parameters
        self.time_interval = 2 # sample time in seconds
        self.gps_time_out_tolerance = 10 # GPS disconnection time tolerance in seconds
        self.gps_accuracy = 3 # GPS accuracy
        self.disconnect_bound = 10 # number of consecutive disconnection readings ('NaN')
        self.out_of_bound = 10 # number of consecutive out-of-bounds readings
        self.HDOP_threshold = 6 # HDOP threshold
        self.PDOP_threshold = 7 # PDOP threshold

    def return_anchor_position(self):
        return self.anchor_lat, self.anchor_long
    
    def define_area(self):
        # define the area of the anchor
        if self.angleswipe > self.swipe:
            limits = [0, self.angleswipe-self.swipe]
            limits2 = [360-self.swipe, 360]
        elif (self.angleswipe == self.swipe):
            limits = [360-self.swipe, 360]
            limits2 = [360-self.swipe, 360]
        else:
            limits = [90-(self.swipe-self.angleswipe), 360-(self.swipe-self.angleswipe)]
            limits2 = [90-(self.swipe-self.angleswipe), 360-(self.swipe-self.angleswipe)]
        return limits, limits2

    def check_gps(self):
        time_difference = (self.current_time-self.prev_time).total_seconds()
        # if the time difference is greater than the time out tolerance and value is NaN?, then the GPS is not working
        if self.gnss_method == 0:
            if time_difference > self.gps_time_out_tolerance:
                self.disconnect_counter += 1
            if self.disconnect_counter > self.disconnect_bound:
                print('GPS Disconnection Alarm')
                self.disconnect_counter = 0 # reset alarm
        elif time_difference>=self.time_interval:
                if self.hdop<self.HDOP_threshold and self.pdop<self.PDOP_threshold:   
                    dic = Geodesic.WGS84.Inverse(self.prev_lat, self.prev_long, self.lat, self.long)
                    dic2 = Geodesic.WGS84.Inverse(self.initial_lat, self.initial_long, self.lat, self.long)
                    position_distance_2 = dic2["s12"]
                    self.position_distance = dic["s12"]
                    self.prev_lat = self.lat
                    self.prev_long = self.long
                else:
                    self.position_distance = 0 # if the HDOP or PDOP is too high, then the distance is 0 (stay in same position)
                # if the distance between current and previous position is smaller than 2*gps accuracy, then GPS value is valid
                if self.position_distance<2*self.gps_accuracy:
                    self.position_counter += 1
                    self.prev_time = self.current_time
                    # calculate distance between anchor position and current position
                    print(f'Anchor Position: {self.anchor_lat:.6f}, {self.anchor_long:.6f}')
                    print(f'Current Position: {self.lat:.6f}, {self.long:.6f}')
                    dic = Geodesic.WGS84.Inverse(self.anchor_lat, self.anchor_long, self.lat, self.long)
                    distance_vessel = dic["s12"] # distance in meters
                    self.azimuth = dic["azi1"] # anchor to vessel azimuth
                    # print(f'Distance between anchor position and current position: {distance_vessel:.4f} meters')
                    # if the distance is outside of the arc radius and swipe, then the ship is drifting
                    limits1, limits2 = self.define_area()
                    if(self.azimuth<0):
                        normalized_angle = 360+self.azimuth-90
                    else:
                        normalized_angle = self.azimuth

                    normalized_angle %= 360-90

                    print(f'Azimuth: {self.azimuth}')
                    print(f'Normalized Angle: {normalized_angle}')
                    print(f'Limits: {limits1} {limits2}')
                    # Check if vessel is outside of the radius of the smaller circle
                    if distance_vessel >self.radius:
                        self.bound_counter_lv1 +=1
                        # consecutive out-of-bound readings
                        if self.bound_counter_lv1>=self.out_of_bound:
                            print(f'{self.position_counter}: Level 1 Drifting Alarm')
                            self.alarm_lv1 = True
                            self.bound_counter_lv1 = 0

                    # Check if the vessel is outside of the defined arc
                    if distance_vessel>self.arc_radius or (normalized_angle>limits1[0] and normalized_angle<limits1[1]) or (normalized_angle>limits2[0] and normalized_angle<limits2[1]):
                        self.bound_counter +=1
                        # consecutive out-of-bound readings
                        if self.bound_counter>=self.out_of_bound:
                            print(f'{self.position_counter}: Level 2 Drifting Alarm')
                            self.alarm_lv2 = True
                            self.bound_counter = 0
                            return self.anchor_distance, self.arc_radius, self.alarm_lv1, self.alarm_lv2
                    else:
                        print(f'{self.position_counter}: No Drifting')
                        self.bound_counter = 0
        # return current anchor_distance and tolerance radius                
        return self.anchor_distance, self.arc_radius, self.alarm_lv1, self.alarm_lv2

    def read_message(self, current_message):
        # If first message, calculate position of anchor and radius
        number = '8'
        if self.message == 0:
            self.message = current_message
            # transform message into processing data
            self.roll = self.message['imu']['roll']
            self.pitch = self.message['imu']['pitch']
            self.yaw = self.message['imu']['yaw']
            self.messageID = self.message['messageID']
            self.boatbus_timestamp = self.message['boatbus_timestamp']
            self.lat = current_message.get('boatbus_full_unsync', {}).get('position', {}).get(number, {}).get('latitude')
            self.long = current_message.get('boatbus_full_unsync', {}).get('position', {}).get(number, {}).get('longitude')
            self.heading = current_message.get('boatbus_full_unsync', {}).get('heading', {}).get(number, {}).get('heading')
            self.altitude = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('altitude')
            self.gnss_method = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('gnss_method')
            self.n_satellites = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('n_satellites')
            self.hdop = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('hdop')
            self.pdop = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('pdop')
            self.prev_time = pd.to_datetime(self.boatbus_timestamp, unit = 'ms')
            print(f'Previous Time: {self.prev_time}')
            self.current_time = self.prev_time
            print(f'Current Time: {self.current_time}')
            # self.lat = self.message['boatbus']['lat']
            # self.long = self.message['boatbus']['long']
            self.prev_lat = self.lat
            self.prev_long = self.long
            self.initial_lat = self.lat
            self.initial_long = self.long
        else:
            # check current GPS position
            self.message = current_message
            self.roll = self.message['imu']['roll']
            self.pitch = self.message['imu']['pitch']
            self.yaw = self.message['imu']['yaw']
            self.messageID = self.message['messageID']
            self.boatbus_timestamp = self.message['boatbus_timestamp']
            self.lat = current_message.get('boatbus_full_unsync', {}).get('position', {}).get(number, {}).get('latitude')
            self.long = current_message.get('boatbus_full_unsync', {}).get('position', {}).get(number, {}).get('longitude')
            self.heading = current_message.get('boatbus_full_unsync', {}).get('heading', {}).get(number, {}).get('heading')
            self.altitude = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('altitude')
            self.gnss_method = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('gnss_method')
            self.n_satellites = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('n_satellites')
            self.hdop = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('hdop')
            self.pdop = current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number,  {}).get('pdop')
            # self.current_time = pd.to_datetime(current_message.get('boatbus_full_unsync', {}).get('gnss', {}).get(number, {}).get('timestamp'), unit='ms')
            self.current_time = pd.to_datetime(self.boatbus_timestamp, unit = 'ms')
            if (self.gnss_method == 'None'):
                self.gnss_method = 0
            _, _, self.alarm_lv1, self.alarm_lv2 = self.check_gps()
            return self.alarm_lv1, self.alarm_lv2

    def define_anchor_area(self, anchor_lat, anchor_long, radius, arc_radius, swipe, angleswipe):
        print('Defining Anchor Area')
        self.anchor_lat = anchor_lat
        self.anchor_long = anchor_long 
        self.radius = radius # in meters
        self.arc_radius = arc_radius # in meters
        self.swipe = swipe # in degrees
        self.angleswipe = angleswipe # in degrees
        print(f'Radius and Arc Radius: {radius} {arc_radius} meters')
        print(f'Anchor position: ({anchor_lat}, {anchor_long}) º')
        print(f'Swipe: {swipe} º')
        print(f'Angle Swipe: {angleswipe} º')
    def alarm(self, alarm_status):
        self.alarm_status = alarm_status

    def return_alarm_status(self):
        return self.alarm_status
