
class Data():
    def __init__(self):
        self.radius = 0
        self.arc_radius = 0
        self.angle_swipe = 0
        self.swipe = 0
        self.lat = 0
        self.long = 0
        self.data = 0
        
        self.vessel_lat = 0
        self.vessel_long = 0
        self.vessel_time = 0 
        self.vessel_heading = 0
        self.vessel_alarm_1 = False
        self.vessel_alarm_2 = False
        self.vessel_data = 0

    
    def update(self, data):
        self.radius = data.radius
        self.arc_radius = data.arc_radius
        self.angle_swipe = data.angle_swipe
        self.swipe = data.swipe
        self.lat = data.lat
        self.long = data.long
        self.data = data
    
    def update_gps_data(self, gps_data):
        self.vessel_lat = gps_data["lat"]
        self.vessel_long = gps_data["long"]
        self.vessel_time = gps_data["time"]
        self.vessel_heading = gps_data["heading"]
        self.vessel_alarm_1 = gps_data["alarm_1"]
        self.vessel_alarm_2 = gps_data["alarm_2"]
        self.vessel_data = gps_data
    

    def get_data(self):
        return self.data
    
    def get_gps_data(self):
        return self.vessel_data

