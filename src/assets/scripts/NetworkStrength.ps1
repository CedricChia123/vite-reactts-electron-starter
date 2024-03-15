# Run the netsh command to show WLAN interfaces and capture the output
$output = Invoke-Expression 'netsh wlan show interfaces'

# Display the signal strength
Write-Host "$output"
