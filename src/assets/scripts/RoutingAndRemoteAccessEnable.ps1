# Require administrator privileges
param([switch]$Elevated)

function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if ((Test-Admin) -eq $false) {
    if ($elevated) {
        # Tried to elevate, did not work, aborting
    }
    else {
        Start-Process powershell.exe -Verb RunAs -ArgumentList ('-noprofile -file "{0}" -elevated' -f ($myinvocation.MyCommand.Definition))
    }
    exit
}

'Running with full privileges'

# Start and set the service to automatic
Start-Service RemoteAccess
Set-Service RemoteAccess -StartupType Automatic

# Check the status and startup type of the service
$serviceInfo = Get-Service RemoteAccess
$serviceStatus = $serviceInfo.Status
$serviceStartType = (Get-WmiObject Win32_Service -Filter "name = 'RemoteAccess'").StartMode

# Prepare custom message
$customMessage = @"
Routing and Remote Access Service Update:
- Service Name: $($serviceInfo.Name)
- Display Name: $($serviceInfo.DisplayName)
- Current Status: $serviceStatus
- Startup Type: $serviceStartType

Routing and Remote Access has been successfully enabled and set to start automatically.
"@


# Output the custom message to the console as well
Write-Output $customMessage