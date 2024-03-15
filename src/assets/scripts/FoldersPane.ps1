Write-Host "Resetting Folder View settings to default..."

# Define the registry paths to check and clean
$registryPaths = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Streams\Desktop',
    'HKCU:\Software\Microsoft\Windows\Shell\Bags',
    'HKCU:\Software\Microsoft\Windows\ShellNoRoam\BagMRU',
    'HKCU:\Software\Microsoft\Windows\ShellNoRoam\Bags'
)

foreach ($path in $registryPaths) {
    if (Test-Path $path) {
        # Only proceed if the path exists
        Get-ChildItem $path -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cleared items from $path"
    }
    else {
        Write-Host "The registry key at path '$path' does not exist."
    }
}

# Restart Explorer
try {
    Stop-Process -Name explorer -Force
    Start-Sleep -Seconds 2 # Wait for the process to fully exit before restarting
    Start-Process explorer
    Write-Host "Windows Explorer has been restarted."
}
catch {
    Write-Host "An error occurred while restarting Windows Explorer."
}

Write-Host "Folder View settings have been reset."