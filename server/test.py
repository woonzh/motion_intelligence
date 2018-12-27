import pandas as pd
import json
import process
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import time
import os
from OpenSSL import SSL, crypto


#with open('logging.txt') as f:
#    store=f.read()
#    
#a=eval(store)
#
#width=len(a[0])
#height=len(a)
#
#new_image = Image.new('RGB', (width, height))
#data = new_image.load()
#
#for y in range(height):
#    for x in range(width):
#        data[(x, y)] = (tuple(a[y][x]))
#
#new_image.save('foo.png', 'png')
#img=mpimg.imread('foo.png')
#imgplot = plt.imshow(img)
#plt.show()
#
#start=time.time()
#
##res, locs, encode=process.main([a])
#res=process.regFaces([a])
#end=time.time()
#
#print(end-start)

#print(res)


#fname='incoming images/0.txt'
#with open(fname) as f:
#    store=f.read()
#fullImg=eval(store)

def create_self_signed_cert(certfile, keyfile, certargs, cert_dir="."):
    C_F = os.path.join(cert_dir, certfile)
    K_F = os.path.join(cert_dir, keyfile)
    if not os.path.exists(C_F) or not os.path.exists(K_F):
        k = crypto.PKey()
        k.generate_key(crypto.TYPE_RSA, 1024)
        cert = crypto.X509()
        cert.get_subject().C = certargs["Country"]
        cert.get_subject().ST = certargs["State"]
        cert.get_subject().L = certargs["City"]
        cert.get_subject().O = certargs["Organization"]
        cert.get_subject().OU = certargs["Org. Unit"]
        cert.get_subject().CN = 'Example'
        cert.set_serial_number(1000)
        cert.gmtime_adj_notBefore(0)
        cert.gmtime_adj_notAfter(315360000)
        cert.set_issuer(cert.get_subject())
        cert.set_pubkey(k)
        cert.sign(k, 'sha1')
        open(C_F, "wb").write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
        open(K_F, "wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))

CERT_FILE = "amaris_cert.pem"
KEY_FILE = "amaris_key.pem"
create_self_signed_cert(CERT_FILE, KEY_FILE,
                            certargs=
                            {"Country": "US",
                             "State": "NY",
                             "City": "Ithaca",
                             "Organization": "Python-Bugs",
                             "Org. Unit": "Proof of Concept"})