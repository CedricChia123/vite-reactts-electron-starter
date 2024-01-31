# Selecting apps in the computer
$zoom = '*Zoom*';
$checkZoom = (Get-ChildItem "C:\Users\e0725196\AppData\Roaming\Microsoft\Windows\Start Menu\Programs" | Where { $_.Name -like $zoom}) -ne $null
if ($checkZoom) {
    $zoomCount = 0
} else {
    $zoomCount = 1
}

Write-Output "Zoom"
$zoomCount

$Examplify = '*Examplify*';
$ExamplifyCount = 0
$checkExamplify = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $Examplify}) -ne $null
$ExamplifyVersion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $Examplify}) | Select DisplayVersion
if ($checkExamplify) {
    $ExamplifyCount = 0
} elseIf ($ExamplifyVersion.DisplayVersion -ge [Version]"0.0.0000") {
    $ExamplifyCount = 1
} else {
    $ExamplifyCount = 2
}

Write-Output "Examplify"
$ExamplifyCount

$nBox = '*nBox*';
$nBoxCount = 0
$checknBox = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $nBox}) -ne $null
$nBoxVersion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $nBox}) | Select DisplayVersion
if ($checknBox) {
    $nBoxCount = 0
} elseIf ($nBoxVersion.DisplayVersion -ge [Version]"0.0.0000") {
    $nBoxCount = 1
} else {
    $nBoxCount = 2
}

Write-Output "nBox"
$nBoxCount

$PulseSecure = '*Pulse Secure 9*';
$PScount = 0
$checkPulseSecure =(Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $PulseSecure}) -ne $null
$PSversion = (Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Where { $_.DisplayName -like $PulseSecure}) | Select DisplayVersion
if (!$checkPulseSecure) {
    $PScount = 0
} elseIf ($PSversion.DisplayVersion -ge [Version]"9.0.4984") {
    $PScount = 1
} else {
    $PScount = 2
}

Write-Output "Pulse Secure"
$PScount