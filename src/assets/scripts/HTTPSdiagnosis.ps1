# PowerShell script to help diagnose HTTPS connection issues

# Check System Time and Date
Write-Host "Checking system time and date..."
$SystemTime = Get-Date
Write-Host "System Time: $SystemTime"

# Test Connectivity to a Known HTTPS Site
Write-Host "Testing connectivity to a known HTTPS site (www.google.com)..."
$TestSite = "www.google.com"
try {
    $Request = Invoke-WebRequest -Uri https://$TestSite -TimeoutSec 10
    Write-Host "Successfully connected to $TestSite."
} catch {
    Write-Host "Failed to connect to $TestSite. Error: $_"
}

# Check for Proxy Settings
Write-Host "Checking for proxy settings..."
$Proxy = [System.Net.WebRequest]::DefaultWebProxy
if ($Proxy -ne $null -and $Proxy.GetProxy("http://www.google.com").Host -ne $null) {
    Write-Host "Proxy is configured: $($Proxy.GetProxy("http://www.google.com"))"
} else {
    Write-Host "No proxy configuration detected."
}

# Check DNS Resolution
Write-Host "Checking DNS resolution for $TestSite..."
try {
    $DNSResult = Resolve-DnsName $TestSite
    Write-Host "$TestSite resolves to $($DNSResult.IPAddress)"
} catch {
    Write-Host "DNS resolution failed for $TestSite. Error: $_"
}

# Verify if Windows Firewall is enabled
Write-Host "Checking if Windows Firewall is enabled..."
$FirewallStatus = Get-NetFirewallProfile -Profile Domain,Public,Private | Select-Object -Property Name,Enabled
Write-Host "Firewall status:"
$FirewallStatus | ForEach-Object { Write-Host "$($_.Name) enabled: $($_.Enabled)" }

# This is a basic diagnostic script. Depending on the issue, further checks might be required.
