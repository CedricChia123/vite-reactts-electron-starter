# Release the IP address for all adapters
Write-Host "Releasing IP addresses for all adapters..."
Invoke-Expression 'ipconfig /release'

Start-Sleep -Seconds 5

# Renew the IP address for all adapters
Write-Host "Renewing IP addresses for all adapters..."
Invoke-Expression 'ipconfig /renew'

Write-Host "IP address release and renew complete."
