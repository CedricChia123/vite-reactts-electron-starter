$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "text/plain")


$body='[
    "Storage":{
        "C":{"free":9,"total":999},
        "D":{"free":20,"total":888}},
    "Applications":{"Zoom":"Installed","Examplify":"Not Installed"}
    ]'


Write-Host $body
$response = Invoke-RestMethod 'https://fmd0gi6suf.execute-api.us-east-1.amazonaws.com/dev/selfhealinginternship/actual.txt' -Method 'PUT' -Headers $headers -Body $body
$response | ConvertTo-Json
Write-Host "321"