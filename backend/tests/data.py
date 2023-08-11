
class Data():
    def __init__(self):
        self.radius = 0
        self.arc_radius = 0
        self.angle_swipe = 0
        self.swipe = 0
        self.lat = 0
        self.long = 0
        self.data = 0

    
    def update(self, data):
        self.radius = data.radius
        self.arc_radius = data.arc_radius
        self.angle_swipe = data.angle_swipe
        self.swipe = data.swipe
        self.lat = data.lat
        self.long = data.long
        self.data = data

    def get_data(self):
        return self.data

