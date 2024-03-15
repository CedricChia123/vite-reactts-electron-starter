# Closing Chrome
Write-Host "Closing Chrome..."
Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue

Write-Host "Deleting Chrome Cache and Browsing History..."

# Dynamically getting the current user's profile path for Chrome
$chromeProfilePath = Join-Path -Path $env:USERPROFILE -ChildPath "AppData\Local\Google\Chrome\User Data\Default"

# Deleting Chrome cache, history, and other data
$pathsToDelete = @(
    "Cache\*",
    "History",
    "History Provider Cache",
    "Web Data",
    "Cookies",
    "Login Data"
)

foreach ($path in $pathsToDelete) {
    $fullPath = Join-Path -Path $chromeProfilePath -ChildPath $path
    Remove-Item -Path $fullPath -Force -Recurse -ErrorAction SilentlyContinue
}

Write-Host "Deletion Complete!"