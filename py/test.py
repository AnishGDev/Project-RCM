import rpyc
import time
import math
import zerorpc
#conn = rpyc.classic.connect('169.254.56.88') # host name or IP address of the EV3
#ev3dev2 = conn.modules['ev3dev2.motor']
#gyro = conn.modules['ev3dev2.sensor.lego'].GyroSensor()
#gyro.mode = 'GYRO-RATE'
#gyro.mode = 'GYRO-ANG'
#print("RESETTED")
#time.sleep(0.5)
#steer_pair = ev3dev2.MoveSteering(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C, motor_class=ev3dev2.LargeMotor)
#joystick_pair = ev3dev2.MoveJoystick(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C)
WHEEL_RADIUS = 2.7

class RobotServer(object):
    ev3dev2 = None
    gyro = None
    joystick_pair = None
    steer_pair = None
    def moveTo(self, ip, angle, distance):
        try:
            conn = rpyc.classic.connect(ip)
        except Exception as e:
            return e
        try:
            self.ev3dev2 = conn.modules['ev3dev2.motor']
            self.gyro = conn.modules['ev3dev2.sensor.lego'].GyroSensor()
            self.gyro.mode = 'GYRO-RATE' # RESET GYRO
            self.gyro.mode = 'GYRO-ANG' # RESET GYRO
            time.sleep(0.5)
            self.joystick_pair = self.ev3dev2.MoveJoystick(self.ev3dev2.OUTPUT_B, self.ev3dev2.OUTPUT_C)
            self.steer_pair = self.ev3dev2.MoveSteering(self.ev3dev2.OUTPUT_B, self.ev3dev2.OUTPUT_C, motor_class=self.ev3dev2.LargeMotor)
            self.drive_to(distance, angle)
        except Exception as e:
            return e
    def testConnection(self, ip):
        try:
            conn=rpyc.classic.connect(ip)
        except Exception as e:
            return e
    def drive_to(self, distance, angle):
        self.turn_angle(angle)
        print("STEERING FORWARD")
        self.steer_pair.on_for_rotations(0, 20, distance/(2*math.pi*WHEEL_RADIUS))
    def turn_angle(self, angle):
        target=angle
        last_error = derivative= integral = 0
        kp = 1
        kd=0
        ki=float(0)
        correction = 0
        acceptable_error = 3
        while(True):
            value = self.gyro.angle
            #if (abs(target-value) < 4.5):
             #   print("Final correction was " + str(correction))
              #  break
            print(value)
            error = target-value
            integral = integral + error
            derivative = error - last_error
            last_error = error
            correction = (error*kp)+(integral*ki)+(derivative*kd)
            print("CORRECTION IS" + str(correction))
            if (abs(correction) <= acceptable_error):
                print("BREAKING OUTTA HERE!")
                break
            self.joystick_pair.on(correction,0,360)
            time.sleep(0.01)

    def turnAngle(self, angle):
        target= angle

#print("AT THE END: " + str(gyro.angle))

#drive_to(20, 90)
#steer_pair.on(0,0)


def parse_port():
    return 9999

def main():
    addr = 'tcp://127.0.0.1:' + str(parse_port())
    s = zerorpc.Server(RobotServer())
    s.bind(addr)
    print('start running on {}'.format(addr))
    s.run()

if __name__ == "__main__":
    main()