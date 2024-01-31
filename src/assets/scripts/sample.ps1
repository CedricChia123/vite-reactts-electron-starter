$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")


$body='{"Storage1 Free":10,"Storage1 Size":20,"Zoom":true,"Examplify":false}'


Write-Host $body
$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/sample.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"