# Define the path to the Microsoft Edge Cookies file
$cookiesPath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cookies"

# Attempt to close Microsoft Edge to prevent file access conflicts
Get-Process 'msedge' -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for a moment to ensure Edge processes have been terminated
Start-Sleep -Seconds 2

# Delete the Cookies file
if (Test-Path $cookiesPath) {
    Remove-Item $cookiesPath -Force
    Write-Host "Cookies in Microsoft Edge have been deleted successfully." -ForegroundColor Green
}
else {
    Write-Host "Cookies file not found. It's possible that cookies were already cleared or the path is incorrect." -ForegroundColor Yellow
}

