$preStorage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size 
$preFree = [math]::Round(($Storage | Measure-Object 'FreeSpace' -Sum).Sum/1GB,3) 

$objShell = New-Object -ComObject Shell.Application 

$objFolder = $objShell.Namespace(0xA) 

$WinTemp = "c:\Windows\Temp\*" 

#1# Remove Temp Files  

write-Host "Removing Temp" -ForegroundColor Green  

Set-Location “C:\Windows\Temp”  

Remove-Item * -Recurse -Force -ErrorAction SilentlyContinue  

Set-Location “C:\Windows\Prefetch”  

Remove-Item * -Recurse -Force -ErrorAction SilentlyContinue  

Set-Location “C:\Documents and Settings”  

Remove-Item “.\*\Local Settings\temp\*” -Recurse -Force -ErrorAction SilentlyContinue  

Set-Location “C:\Users”  

Remove-Item “.\*\Appdata\Local\Temp\*” -Recurse -Force -ErrorAction SilentlyContinue  

#2# Empty Recycle Bin  

write-Host "Emptying Recycle Bin." -ForegroundColor Blue  

$objFolder.items() | %{ remove-item $_.path -Recurse -Confirm:$false}  

#3# Running Disk Clean up Tool  

write-Host "Running the Windows Disk Clean up Tool" -ForegroundColor White  

cleanmgr /sagerun:1 | out-Null  

$([char]7)  

# Sleep 3  

write-Host "Cleanup task complete!" -ForegroundColor Yellow  

# Sleep 3  

$postStorage = Get-WmiObject -Class win32_logicaldisk | select DeviceID, FreeSpace, Size 
$postFree = [math]::Round(($Storage | Measure-Object 'FreeSpace' -Sum).Sum/1GB,3) 
$cleared=[math]::Round(($preFree - $postFree),2)
$wshell = New-Object -ComObject Wscript.shell
$text="Disk Cleanup Completed."
$text+= "`r`n"
$text+="Before: "
$text+=$preFree
$text+="GB"
$text+= "`r`n"
$text+="After: "
$text+=$postFree
$text+="GB"
$text+= "`r`n"
$text+="Cleared: "
$text+=$cleared
$text+="GB"
$text+= "`r`n"
$text+="Please head back to the brower"
$text
$output = $wshell.Popup($text)
##### End of the Script #####

