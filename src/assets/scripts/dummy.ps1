$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")

# Finding the storage size of computer

# $storage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size | Format-Table DeviceId, @{n="Size";e={[math]::Round($_.Size/1GB,2)}},@{n="FreeSpace";e={[math]::Round($_.FreeSpace/1GB,2)}}
# $storage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size 
# $total = [math]::Round(($Storage | Measure-Object 'Size' -Sum).Sum/1GB,2) 
# $total

# $storage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size 
# $free = [math]::Round(($Storage | Measure-Object 'FreeSpace' -Sum).Sum/1GB,2) 
# $free



# # Selecting apps in the computer
# $zoom = '*Zoom*';
# $installedZoom = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $zoom}) -ne $null

# $Examplify = '*Examplify*';
# $installedExamplify = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $Examplify}) -ne $null

# $PulseSecure = '*Pulse Secure 9.1*';
# $installedPulseSecure =(Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $PulseSecure}) -ne $null


$body='{
    "Storage":{
        "C":{"free":10,"total":500},
        "D":{"free":20,"total":300}},
    "Applications":{"Zoom":"Installed","Examplify":"Not Installed"}
    }'

# $body=''
# $body+='{"Storage":{"Free":"'
# $body+=$free
# $body+='","Total":"'
# $body+=$total
# $body+='"},"Applications":{"Zoom":'
# $body+=$installedZoom
# $body+=',"Examplify":'
# $body+=$installedExamplify
# $body+=',"PulseSecure":'
# $body+=$installedPulseSecure
# $body+='}}'
Write-Host $body

$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/PStest.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"