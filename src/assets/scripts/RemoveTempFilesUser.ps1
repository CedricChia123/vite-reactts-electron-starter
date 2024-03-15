# Construct the path to the current user's Temp folder
$Path3 = [System.Environment]::ExpandEnvironmentVariables('%USERPROFILE%\AppData\Local\Temp')

# Remove all items (files and directories) from the current user's Temp folder
Get-ChildItem $Path3 -Force -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Removing $($_.FullName)"
    $_ | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# Display a success message
Write-Host "Removed all the temp files successfully" -ForegroundColor Green
