$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")


$body='{
    "Storage":{"Free":9,"Total":999},
    "Applications":{"Zoom":false,"Examplify":true}
    }'


Write-Host $body
$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/actualPS.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"