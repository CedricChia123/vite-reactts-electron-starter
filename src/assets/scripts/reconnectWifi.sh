#!/bin/bash

networksetup -setairportpower en0 off
sleep 2
networksetup -setairportpower en0 on
sleep 2
avgWifi=$(ping -c 10 8.8.8.8 | tail -1| awk '{print $4}' | cut -d '/' -f 2)

text='Wifi Reconnected, Your current ping: '
text+=$avgWifi
text+='ms'

body=''
body+=$avgWifi
body+='ms'

curl -X PUT -d $body -H "Content-Type: application/json" 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/wifiPing.txt'


osascript -e 'tell application (path to frontmost application as text) to display dialog "'"${text//\"/\\\"}"'" buttons {"OK"} with icon caution'