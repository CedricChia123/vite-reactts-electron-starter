$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")


$body="text"


Write-Host $body
$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/testing.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"