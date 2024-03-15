# Require administrator privileges
param([switch]$Elevated)

function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if ((Test-Admin) -eq $false) {
    if ($elevated) {
        # Tried to elevate, did not work, aborting
        "Tried to elevate, but did not work. Aborting." | Out-File -FilePath $filePath -Force
    }
    else {
        Start-Process powershell.exe -Verb RunAs -ArgumentList ('-noprofile -file "{0}" -elevated' -f ($myinvocation.MyCommand.Definition))
    }
    exit
}

# Running with full privileges
'Running with full privileges'

# Stop and disable the RemoteAccess service
Stop-Service RemoteAccess
Set-Service RemoteAccess -StartupType Disabled

# Display service information
Get-Service RemoteAccess | Format-List Name, DisplayName, Status, StartType
