# Require administrator privileges
param([switch]$Elevated)

function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if ((Test-Admin) -eq $false)  {
    if ($elevated) {
        # tried to elevate, did not work, aborting
    } else {
        Start-Process powershell.exe -Verb RunAs -ArgumentList ('-noprofile -file "{0}" -elevated' -f ($myinvocation.MyCommand.Definition))
    }
    exit
}

'running with full privileges'

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")

$signal=(netsh wlan show interface) -match '^\s+Signal' -replace '^\s+Signal\s+:\s+',''

$body=''
$body+=$signal
$body+=''

netsh interface show interface
netsh interface set interface Wi-Fi disable
netsh interface set interface Wi-Fi enable


Write-Host $body

$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/PStest.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"

$wshell = New-Object -ComObject Wscript.shell
$output = $wshell.Popup("Finished Wifi Reconnect, please head back to the brower")