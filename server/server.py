#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Dec  2 17:49:47 2018

@author: zhenhao
"""

from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS

import logging
import process

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
CORS(app)

#@socketio.on_connect()
#def connected():
#    emit('hello')
    
#
@socketio.on('my event')
def test_message(message):
    print('test')
    emit('my response', {'data': message['data']})

@socketio.on('my broadcast event')
def test_message(message):
    logger.info('testing')
#    with open('logging.txt', 'w+') as f:
#        f.write(str(message['data']))
    
    pred=process.main(message['data'])
        
    emit('my response', {'data': pred}, broadcast=True)
    
@socketio.on('facereg')
def face_reg(message):
    logger.info('testing')
#    count=0
    
#    for i in message:
#        with open('incoming images/%s.txt'%(str(count)), 'w+') as f:
#            f.write(str(i))
#        count+=1
    
    if len(message)>0:
        pred=process.regFaces(message)
        emit('my response', {'data': pred}, broadcast=True)
    else:
        emit('my response', {'data': []}, broadcast=True)



if __name__ == '__main__':
    logger.info('Running socket IO')
    socketio.run(app, host='0.0.0.0', debug=True, port=9997, use_reloader=False, certfile='amaris_cert.pem', keyfile='amaris_key.pem')
#    socketio.run(app, host='localhost', port=8080)
