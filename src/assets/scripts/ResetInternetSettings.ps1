# Reset Internet Explorer settings
cmd /c "rundll32 inetcpl.cpl ResetIEtoDefaults"

# Flush DNS cache
Clear-DnsClientCache

# Reset TCP/IP stack
netsh int ip reset c:\resetlog.txt

# Release and renew IP address
ipconfig /release
ipconfig /renew
