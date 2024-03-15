taskkill /im OUTLOOK.EXE

Start-Process "OUTLOOK.EXE"

Start-Sleep -Seconds 5

Write-Host "Microsoft Outlook has been restarted." -ForegroundColor Green