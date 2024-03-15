Write-Host "Erasing system prefetch files" -ForegroundColor Yellow 

# Specify the path where temporary files are stored in the Windows Prefetch folder
$Path = 'C' + ':\Windows\Prefetch' 

# Remove all items (files and directories) from the Windows Prefetch folder
Get-ChildItem $Path -Force -Recurse -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue  
Write-Host "Removed all prefetch files successfully" -ForegroundColor Green 