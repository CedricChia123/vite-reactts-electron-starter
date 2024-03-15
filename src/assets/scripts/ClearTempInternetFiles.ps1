$env:TEMP, $env:TMP | ForEach-Object {
    $tempPath = $_
    Get-ChildItem -Path $tempPath -Force | ForEach-Object {
        Write-Host "Removing file: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}
