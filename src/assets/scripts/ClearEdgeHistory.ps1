# Define Edge data paths
$edgeDataPaths = @(
    "$env:LOCALAPPDATA\Packages\Microsoft.MicrosoftEdge_8wekyb3d8bbwe\AC\*",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\History",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Web Data"
)

# Close Microsoft Edge
Get-Process 'msedge' -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for a moment to ensure Edge processes have been terminated
Start-Sleep -Seconds 2

# Clear browsing history
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

Write-Host "Microsoft Edge browsing history cleared." -ForegroundColor Green