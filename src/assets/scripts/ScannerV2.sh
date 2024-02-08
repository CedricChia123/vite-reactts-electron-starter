#!/bin/bash

# Getting Storage information
dataTotal=$(df -H /System/Volumes/Data/ | awk 'FNR == 2 {print $2}')
dataFree=$(df -H /System/Volumes/Data/ | awk 'FNR == 2 {print $4}')

free=$dataFree
total=$dataTotal

PostDataFree=$(du -hs ~/Library/Caches | awk '{print $1}');
cacheTotal=${PostDataFree::${#PostDataFree}-1} 

echo $free
echo $total
echo $cacheTotal

getAppVersion() {
    path=$1
    defaultVersion=$2
    # mdfind -onlyin /Applications -name "zoom.us"
    version=$(defaults read $path CFBundleShortVersionString)
    # path=/Applications/zoom.us.app
    # version=$(mdls $path -name kMDItemVersion | awk -F'"' '{print $2}')
    if [ ${#version} == 0 ]
    then 
        appCheck=0
    else 
        appCheck=1
    fi

    appArray=($version)
    appNumber=${appArray[0]}
    # zoomSeparateNumber=${appNumber//./ }
    # echo ${zoomSeparateNumber[0]}

    verlte() {
        [  "$1" = "`echo -e "$1\n$2" | sort -V | head -n1`" ]
    }

    verlt() {
        [ "$1" = "$2" ] && return 1 || verlte $1 $2
    }

    # if version number is smaller than the set check to 2
    verlt $appNumber $defaultVersion && appCheck=$((appCheck+1)) || appCheck=$((appCheck+0))
    # verlte $appNumber 2.5.6 && echo "yes" || echo "no" # no
    return $appCheck
}

echo "Function Test"
echo "------------------------------------"
getAppVersion '/Applications/zoom.us.app/Contents/Info' '5.12.0'
zoomChecker=$?
if [ $zoomChecker -eq 0 ]; then appComment="Not-Installed"
elif [ $zoomChecker -eq 1 ]; then zoomComment="Installed"
else zoomComment="Outdated"
fi
echo "Zoom Check: $zoomComment"
echo " "

getAppVersion '/Applications/Examplify.app/Contents/Info' '0.0.0'
ExamplifyChecker=$?
if [ $ExamplifyChecker -eq 0 ]; then ExamplifyComment="Not-Installed"
elif [ $ExamplifyChecker -eq 1 ]; then ExamplifyComment="Installed"
else ExamplifyComment="Outdated"
fi
echo "Examplify Check: $ExamplifyComment"
echo " "

getAppVersion '/Applications/nBox/nBox.app/Contents/Info' '0.0.0'
nBoxChecker=$?
if [ $nBoxChecker -eq 0 ]; then nBoxComment="Not-Installed"
elif [ $nBoxChecker -eq 1 ]; then nBoxComment="Installed"
else nBoxComment="Outdated"
fi
echo "nBox Check: $nBoxComment"
echo " "

getAppVersion '/Applications/PulseSecure.app/Contents/Info' '0.0.0'
PulseSecureChecker=$?
if [ $PulseSecureChecker -eq 0 ]; then PulseSecureComment="Not-Installed"
elif [ $PulseSecureChecker -eq 1 ]; then PulseSecureComment="Installed"
else PulseSecureComment="Outdated"
fi

echo "PulseSecure Check: $PulseSecureComment"

# apexone, adobecloud, outlook 

getAppVersion '/Applications/Apexone.app/Contents/Info' '0.0.0'
ApexoneChecker=$?

getAppVersion '/Applications/Adobecloud.app/Contents/Info' '0.0.0'
AdobeCloudChecker=$?

getAppVersion '/Applications/Outlook.app/Contents/Info' '0.0.0'
OutlookChecker=$?

# Finding wifi singal
# totalWifi=0
# for i in {1..10}
# do
#     signal=$(/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep agrCtlRSSI | awk '{print $2}')
#     wifi=$(($signal + 100))
#     echo $wifi
#     totalWifi=$(($totalWifi + $wifi))
# doneping
# avgWifi=$(($totalWifi / 10))

avgWifi=$(ping -c 10 8.8.8.8 | tail -1| awk '{print $4}' | cut -d '/' -f 2)

# building content for the file
# body='{"Storage":{"Free":9,"Total":999},"Applications":{"Zoom":true,"Examplify":false}}'

cacheTotal=521.4
avgWifi=50.3

# apexone, adobecloud, outlook 
body=''
body+='{"Storage":{"Free":"'
body+=$free
body+='","Total":"'
body+=$total
body+='","Cache":"'
body+=$cacheTotal
body+='"},"Applications":{"Zoom":'
body+=$zoomChecker
body+=',"Examplify":'
body+=$ExamplifyChecker
body+=',"nBox":'
body+=$nBoxChecker
body+=',"Apexone":'
body+=$ApexoneChecker
body+=',"AdobeCloud":'
body+=$AdobeCloudChecker
body+=',"Outlook":'
body+=$OutlookChecker
body+=',"PulseSecure":'
body+=$PulseSecureChecker
body+='},"Wifi":"'
body+=$avgWifi
body+='ms"}'
echo $body

# Uploading to S3 bucket
curl -X PUT -d $body -H "Content-Type: application/json" 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/actualBashV2.txt'

echo " "
echo "Completed"

# Display a pop up message
text="Finished Scan, please proceed back to the webpage"
osascript -e 'tell application (path to frontmost application as text) to display dialog "'"${text//\"/\\\"}"'" buttons {"OK"} with icon caution'