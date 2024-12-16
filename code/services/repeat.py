#!/usr/bin/env python

# i wrote this to solve some mem/handle leaks in app.js, but that's been fixed now, it should be able to run forever..


import os,time

while True:
	os.system('node participation_matcher.js')
	time.sleep(5)
