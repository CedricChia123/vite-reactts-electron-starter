# Require administrator privileges
param (
    [switch]$Elevated,
    [string]$ProfileLocation
)

function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if (-not (Test-Admin)) {
    if ($Elevated) {
        # tried to elevate, did not work, aborting
        Write-Warning "Unable to elevate privileges."
        exit
    }
    else {
        Start-Process powershell.exe -Verb RunAs -ArgumentList ('-noprofile -file "{0}" -Elevated' -f $MyInvocation.MyCommand.Definition)
        exit
    }
}

# Now you have full privileges here onwards
Write-Host 'Running with full privileges'

# Set profile path if not provided
if ([string]::IsNullOrEmpty($ProfileLocation)) {
    $ProfileLocation = (Split-Path -Parent $env:USERPROFILE)
}

Write-Host 'Getting User List ...... ' -NoNewline
[array] $users = Get-ChildItem -Path $ProfileLocation
[array] $paths = '\AppData\Local\Temp'
Write-Host ' Complete'

Write-Host 'Scanning User Folders... ' -NoNewline
[double]$before = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$($ProfileLocation.SubString(0,2))'").FreeSpace

[int]$iCnt = 0
[int]$UserCount = $users.Count

foreach ($user in $users) {
    Write-Progress -Activity 'Scanning User Folders' -Status ($user.Name).ToUpper() -PercentComplete (($iCnt / $UserCount) * 100)
    foreach ($path in $paths) {
        $fullPath = Join-Path $ProfileLocation -ChildPath "$user\$path"
        if (Test-Path -Path $fullPath) {
            Get-ChildItem -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
                Write-Host "Removing $($_.FullName)"
                $_ | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }
    $iCnt++
}

Write-Host 'Complete'
