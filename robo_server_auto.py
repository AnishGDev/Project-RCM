import rpyc
import time
import math
import zerorpc
'''
conn = rpyc.classic.connect('169.254.198.67') # host name or IP address of the EV3
ev3 = conn.modules['ev3dev.ev3']      # import ev3dev.ev3 remotely
ev3dev2 = conn.modules['ev3dev2.motor']
sensors = conn.modules['ev3dev2.sensor.lego']
button = conn.modules['ev3dev2.button']
gyro = sensors.GyroSensor()
gyro.mode = 'GYRO-RATE'
gyro.mode = 'GYRO-ANG'
print("RESETTED")
time.sleep(0.5)
lm = ev3dev2.LargeMotor()
steer_pair = ev3dev2.MoveSteering(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C, motor_class=ev3dev2.LargeMotor)
joystick_pair = ev3dev2.MoveJoystick(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C)
'''
WHEEL_RADIUS = 2.7
conn = None

ev3dev2 = None
gyro = None
steer_pair = None
joystick_pair = None

class RobotServer(object):
    def moveTo(self, ip, angle, distance):
        global conn, ev3dev2, gyro, steer_pair, joystick_pair
        assert(rpyc.classic.connect(ip))
        conn = rpyc.classic.connect(ip)
        ev3dev2 = conn.modules['ev3dev2.motor']
        gyro = conn.modules['ev3dev2.sensor.lego'].GyroSensor()
        gyro.mode = 'GYRO-RATE'
        gyro.mode = 'GYRO-ANG'
        time.sleep(0.5)
        steer_pair = ev3dev2.MoveSteering(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C, motor_class=ev3dev2.LargeMotor)
        joystick_pair = ev3dev2.MoveJoystick(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C)
        turn_angle(angle)
        steer_pair.on_for_rotations(0, 20, distance/(2*math.pi*WHEEL_RADIUS))
    def testConnection(self, ip):
        rpyc.classic.connect(ip)
    def lmao(self):
        return "yeet"


def drive_to(distance, angle):
    turn_angle(angle)
    print("STEERING FORWARD")
    steer_pair.on_for_rotations(0, 20, distance/(2*math.pi*WHEEL_RADIUS))


def turn_angle(angle):
    target=angle
    last_error = derivative= integral = 0
    kp = 1
    kd=0
    ki=float(0)
    correction = 0
    acceptable_error = 3
    while(True):
        value = gyro.angle
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
        joystick_pair.on(correction,0,360)
        time.sleep(0.01)

def turnAngle(angle):
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