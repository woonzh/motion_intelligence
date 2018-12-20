#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Dec  3 22:49:31 2018

@author: zhenhao
"""

import face_recognition_api
import numpy as np
import pandas as pd
import os
import pickle

fname = 'classifier.pkl'
prediction_dir = './test-images'

encoding_file_path = './encoded-images-data.csv'
df = pd.read_csv(encoding_file_path)
full_data = np.array(df.astype(float).values.tolist())

# Extract features and labels
# remove id column (0th column)
X = np.array(full_data[:, 1:-1])
y = np.array(full_data[:, -1:])

if os.path.isfile(fname):
    with open(fname, 'rb') as f:
        (le, clf) = pickle.load(f)
else:
    print('\x1b[0;37;43m' + "Classifier '{}' does not exist".format(fname) + '\x1b[0m')
    quit()
    
hist = []

def main(img):
    img=np.asarray(img, dtype=np.uint8)
    X_faces_loc = face_recognition_api.face_locations(img)
    
    print("-----test-----")
    
#    return [["unknown", list(loc)] for loc in X_faces_loc]
    
    faces_encodings = face_recognition_api.face_encodings(img, known_face_locations=X_faces_loc)
#    print("Found {} faces in the image".format(len(faces_encodings)))
    
    if len(faces_encodings) >0:
    
        closest_distances = clf.kneighbors(faces_encodings, n_neighbors=1)
    
        is_recognized = [closest_distances[0][i][0] <= 0.5 for i in range(len(X_faces_loc))]
        
        predictions = [[le.inverse_transform([int(pred)])[0], list(loc)] if rec else ["Unknown", loc] for pred, loc, rec in
                       zip(clf.predict(faces_encodings), X_faces_loc, is_recognized)]
    else:
        predictions=[]
    print(predictions)
    
    return predictions, X_faces_loc, faces_encodings

def findDist(coord1, coord2):
    return ((coord1[0]-coord2[0])**2 + (coord2[1] - coord2[1])**2)**0.5

def guessUnknown(coord):
    global hist
    dist = 100
    name='Unknown'
    
    for itm in hist:
        itmCoord = itm[1]
        temDist = findDist(itmCoord, coord)
        if temDist < dist:
            dist = temDist
            name = itm[0]
    
    return name

def regFaces(lst):
    global hist
    faces_encodings=[]
    coords=[]
    print("test %s" %(str(hist)))
    
#    tem=np.asarray(lst, dtype=np.uint8)
#    print(tem.shape)
    for itm in lst:
        img=itm['image']
        coords+=[itm['coord']]
        img=np.asarray(img, dtype=np.uint8)
#        print(img.shape)
        face_encoding = face_recognition_api.face_encodings(img, known_face_locations=[(0, img.shape[1],img.shape[0], 0)])
        faces_encodings.append(face_encoding[0])
    
    if len(faces_encodings)>0:
        closest_distances = clf.kneighbors(faces_encodings, n_neighbors=1)
        is_recognized = [closest_distances[0][i][0] <= 0.5 for i in range(len(lst))]
        predictions = [[le.inverse_transform([int(pred)])[0], coord] if rec else [guessUnknown(coord), coord] for pred, rec, coord in
               zip(clf.predict(faces_encodings),is_recognized, coords)]
    else:
        predictions=[]
    
    hist = predictions
    
    return predictions
        