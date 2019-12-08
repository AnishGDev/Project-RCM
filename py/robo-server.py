import rpyc
import sys
import zerorpc
conn = None
class RobotServer(object):
    global conn
    def connectToRobo(self, ip, angleToTurn, dist):
        try:
            conn = rpyc.classic.connect(ip)
            return "It worked bb"
        except Exception as e:
            return e
    def moveTo(self, ip, angleToTurn, distanceToTravel):
        try:
            conn = rpyc.classic.connect(ip)
        except Exception as e:
            return e
        ev3dev2 = conn.modules['ev3dev2.motor']
        steer_pair = ev3dev2.MoveSteering(ev3dev2.OUTPUT_B, ev3dev2.OUTPUT_C, motor_class=ev3dev2.LargeMotor)
        steer_pair.on_for_rotations(0, 20, 1)


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