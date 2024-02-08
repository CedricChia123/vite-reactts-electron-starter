#!/bin/bash

PreDataFree=$(du -hs ~/Library/Caches | awk '{print $1}');
preFree=${PreDataFree::${#PreDataFree}-1} 

rm -r ~/Library/Caches/*
rm -r /System/Caches/*

PostDataFree=$(du -hs ~/Library/Caches | awk '{print $1}');
postFree=${PostDataFree::${#PostDataFree}-1} 

diff=$(($preFree-$postFree))

text=''
text='Cache cleared'
text+=', '
text+=$diff 
text+='MB freed'

body=''
body+=$postFree

curl -X PUT -d $body -H "Content-Type: application/json" 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/cache.txt'

osascript -e 'tell application (path to frontmost application as text) to display dialog "'"${text//\"/\\\"}"'" buttons {"OK"} with icon caution'