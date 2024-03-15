# Display information about all volumes
Write-Host "Volume Information:" -ForegroundColor Cyan
Get-Volume | Format-Table -AutoSize

# Display information about filesystem drives
Write-Host "Filesystem Drive Information:" -ForegroundColor Cyan
Get-PSDrive -PSProvider 'FileSystem' | Format-Table Name, Used, Free, Root -AutoSize
