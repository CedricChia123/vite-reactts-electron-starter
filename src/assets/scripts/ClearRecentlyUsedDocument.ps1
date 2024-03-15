# Clearing recent documents from the Registry
$recentDocsKeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs"
$runMRUKeyPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU"

# Function to clear recent documents from a specific registry path
function Clear-RecentDocsFromRegistry {
    param (
        [string]$keyPath
    )
    try {
        Remove-ItemProperty -Path $keyPath -Name "*" -ErrorAction Stop
    }
    catch {
        Write-Host "Error clearing recent documents from $($keyPath): $_"
    }
}

# Clear recent documents and run history
Write-Host "Clearing Recently Used Document List" -ForegroundColor Yellow
Clear-RecentDocsFromRegistry -keyPath $recentDocsKeyPath
Clear-RecentDocsFromRegistry -keyPath $runMRUKeyPath

# Optionally, clear the automatic destinations and custom destinations to remove Jump List history
$automaticDestinationsPath = "$env:APPDATA\Microsoft\Windows\Recent\AutomaticDestinations"
$customDestinationsPath = "$env:APPDATA\Microsoft\Windows\Recent\CustomDestinations"

Remove-Item "$automaticDestinationsPath\*" -Force
Remove-Item "$customDestinationsPath\*" -Force
Write-Host "Jump List history cleared." -ForegroundColor Green 

# Notify the user
Write-Host "Recently used documents list has been cleared." -ForegroundColor Green 
