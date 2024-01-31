$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")

# Finding the storage size of computer

# $storage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size | Format-Table DeviceId, @{n="Size";e={[math]::Round($_.Size/1GB,2)}},@{n="FreeSpace";e={[math]::Round($_.FreeSpace/1GB,2)}}
$storage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size 
$total = [math]::Round(($Storage | Measure-Object 'Size' -Sum).Sum/1GB,2) 

$storage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size 
$free = [math]::Round(($Storage | Measure-Object 'FreeSpace' -Sum).Sum/1GB,2) 

$app=Get-ChildItem "C:\Users\e0725196\AppData\Roaming\Microsoft\Windows\Start Menu\Programs"

# Selecting apps in the computer
$zoom = '*Zoom*';
$checkZoom = (Get-ChildItem "C:\Users\e0725196\AppData\Roaming\Microsoft\Windows\Start Menu\Programs" | Where { $_.Name -like $zoom}) -ne $null
if (!$checkZoom) {
    $zoomCount = 0
} else {
    $zoomCount = 1
}

$Examplify = '*Examplify*';
$ExamplifyCount = 0
$checkExamplify = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $Examplify}) -ne $null
$ExamplifyVersion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $Examplify}) | Select DisplayVersion
if (!$checkExamplify) {
    $ExamplifyCount = 0
} elseIf ($ExamplifyVersion.DisplayVersion -ge [Version]"0.0.0000") {
    $ExamplifyCount = 1
} else {
    $ExamplifyCount = 2
}

$nBox = '*nBox*';
$nBoxCount = 0
$checknBox = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $nBox}) -ne $null
$nBoxVersion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $nBox}) | Select DisplayVersion
if (!$checknBox) {
    $nBoxCount = 0
} elseIf ($nBoxVersion.DisplayVersion -ge [Version]"0.0.0000") {
    $nBoxCount = 1
} else {
    $nBoxCount = 2
}

$PulseSecure = '*Pulse Secure 9*';
$PScount = 0
$checkPulseSecure =(Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $PulseSecure}) -ne $null
$PSversion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $PulseSecure}) | Select DisplayVersion
if (!$checkPulseSecure) {
    $PScount = 0
} elseIf ($PSversion.DisplayVersion -ge [Version]”9.10.4984") {
    $PScount = 1
} else {
    $PScount = 2
}

$apexone = '*Apex One*';
$apexonecount = 0
$checkapexone =(Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $apexone}) -ne $null
$apexoneversion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $apexone}) | Select DisplayVersion
if (!$checkapexone) {
    $apexonecount = 0
} elseIf ($apexoneversion.DisplayVersion -ge [Version]”9.10.4984") {
    $apexonecount = 1
} else {
    $apexonecount = 2
}

$adobecloud = '*Adobe Cloud*';
$adobecloudcount = 0
$checkadobecloud =(Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $adobecloud}) -ne $null
$adobecloudversion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $adobecloud}) | Select DisplayVersion
if (!$checkadobecloud) {
    $adobecloudcount = 0
} elseIf ($adobecloudversion.DisplayVersion -ge [Version]”9.10.4984") {
    $adobecloudcount = 1
} else {
    $adobecloudcount = 2
}

$signal=(netsh wlan show interface) -match '^\s+Signal' -replace '^\s+Signal\s+:\s+',''

$body='{"Storage":{"Free":"'
$body+="$free"
$body+='G","Total":"'
$body+="$total"
$body+='G","Cache":"'
$body+="525"
$body+='"},"Applications":{"Zoom":'
$body+="$zoomCount"
$body+=',"Examplify":'
$body+="$ExamplifyCount"
$body+=',"nBox":'
$body+="$nBoxCount"
$body+=',"Apexone":'
$body+="$apexonecount"
$body+=',"AdobeCloud":'
$body+="$adobecloudcount"
$body+=',"PulseSecure":'
$body+="$PScount"
$body+='},"Wifi":"'
$body+="$signal"
$body+='"}'

Write-Host $body

$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/PStest.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"

$wshell = New-Object -ComObject Wscript.shell
$output = $wshell.Popup("Finished Scan, please head back to the brower")