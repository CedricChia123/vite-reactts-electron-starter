#!/bin/bash

# Getting Storage information
dataTotal=$(df -H /System/Volumes/Data/ | awk 'FNR == 2 {print $2}')
dataFree=$(df -H /System/Volumes/Data/ | awk 'FNR == 2 {print $4}')

free=$dataFree
total=$dataTotal

echo $free
echo $total

# Finding what applications have been downloaded
appZoom=$(mdfind -name 'kMDItemFSName=="zoom.us.app"' -onlyin /Volumes/Macintosh\ HD/Applications/ |cut -d "/" -f3|grep .app)
appExamplify=$(mdfind -name 'kMDItemFSName=="Examplify.app"' -onlyin /Volumes/Macintosh\ HD/Applications/ |cut -d "/" -f3|grep .app)
appPulseSecure=$(mdfind -name 'kMDItemFSName=="PulseSecure.app"' -onlyin /Volumes/Macintosh\ HD/Applications/ |cut -d "/" -f3|grep .app)

if [ ${#appZoom} == 0 ]
then 
    Zoom=false
else 
    Zoom=true
fi


if [ ${#appExamplify} == 0 ]
then 
    Examplify=false
else 
    Examplify=true
fi

if [ ${#appPulseSecure} -eq 0 ]
then 
    PulseSecure=false
else 
    PulseSecure=true
fi

# Finding wifi singal
totalWifi=0
for i in {1..10}
do
    signal=$(/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep agrCtlRSSI | awk '{print $2}')
    wifi=$(($signal + 100))
    echo $wifi
    totalWifi=$(($totalWifi + $wifi))
done
avgWifi=$(($totalWifi / 10))

# building content for the file
# body='{"Storage":{"Free":9,"Total":999},"Applications":{"Zoom":true,"Examplify":false}}'

body=''
body+='{"Storage":{"Free":"'
body+=$free
body+='","Total":"'
body+=$total
body+='"},"Applications":{"Zoom":'
body+=$Zoom
body+=',"Examplify":'
body+=$Examplify
body+=',"PulseSecure":'
body+=$PulseSecure
body+='},"Wifi":"'
body+=$avgWifi
body+='%"}'
echo $body

# Uploading to S3 bucket
curl -X PUT -d $body -H "Content-Type: application/json" 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/actualBash.txt'

echo " "
echo "Completed"

# Display a pop up message
text="Finished Scan, please proceed back to the webpage"
osascript -e 'tell application (path to frontmost application as text) to display dialog "'"${text//\"/\\\"}"'" buttons {"OK"} with icon caution'