# Define Edge data paths for history and cache
$edgeDataPaths = @(
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\History",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Web Data" # Contains autofill information
)

# Attempt to close Microsoft Edge to prevent file access conflicts
Get-Process 'msedge' -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for a moment to ensure Edge processes have been terminated
Start-Sleep -Seconds 2

# Clear browsing data that influences the URL dropdown list
foreach ($path in $edgeDataPaths) {
    if (Test-Path $path) {
        try {
            Remove-Item $path -Force -Recurse
            Write-Host "Cleared data at $path"
        }
        catch {
            Write-Error "Failed to clear data at $path. Error: $_"
        }
    }
    else {
        Write-Host "Path not found: $path"
    }
}

Write-Host "Attempted to clear Microsoft Edge URL dropdown list by removing relevant data." -ForegroundColor Green