dataTotal=$(df -H /System/Volumes/Data/ | awk 'FNR == 2 {print $2}')
dataFree=$(df -H /System/Volumes/Data/ | awk 'FNR == 2 {print $4}')

free=$dataFree
total=$dataTotal

PostDataFree=$(du -hs ~/Library/Caches | awk '{print $1}');
postFree=${PostDataFree::${#PostDataFree}-1} 
postFree+='MB'

echo $free
echo $total
echo $postFree