# -*- mode: python -*-

block_cipher = None

import sys
sys.modules['FixTk'] = None

options = [ ('v', None, 'OPTION'), ('W ignore', None, 'OPTION') ]

import os
import escpos

# figure out path to file we need from a site package module
capabilities_json = os.path.join(os.path.dirname(escpos.__file__), 'capabilities.json')

# Conditional trick
binaries_to_ship = [('libusb-1.0.dll', '.')] if sys.platform == 'win32' else []

a = Analysis(['api_pythermal.py'],
             pathex=[
                '/Users/Andy/Devel/print42',
                'c:\\Users\\Andy\\Desktop\\print42-win10'
             ],
             binaries=binaries_to_ship,
             datas= [
                (capabilities_json, 'escpos' ),
             ],
             hiddenimports=[
                'escpos.constants',
                'escpos.escpos',
                'escpos.exceptions',
                'escpos.printer',
                'bottle_websocket',
                'gevent.__ident',
                'gevent._greenlet',
                'gevent.libuv',
                'gevent.libuv.loop',
                'gevent.__semaphore',
                'gevent.__hub_local',
                'gevent.__greenlet_primitives',
                'gevent.__waiter',
                'gevent.__hub_primitives',
                'gevent._event',
                'gevent._queue',
                'gevent.__imap',
                'gevent._local',                
             ],
             hookspath=[],
             runtime_hooks=[],
             excludes=['tcl', 'tk', 'FixTk', '_tkinter', 'tkinter', 'Tkinter', 'numpy','cryptography', 'django', 'PyQt5'],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=True,
          name='api_pythermal',
          debug=False,
          strip=False,
          upx=True,
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               name='api_pythermal')