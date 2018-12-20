#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Dec  2 14:38:44 2018

@author: zhenhao
"""

import train
import create_encodings
import predict

retrain=True

if retrain:
    create_encodings.main()
    train.main()

predict.main()

