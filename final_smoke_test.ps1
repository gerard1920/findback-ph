Write-Host "=== Final QA Smoke Test ==="

Write-Host "`n--- Homepage ---"
$r = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing
Write-Host ("Status: " + $r.StatusCode)

Write-Host "`n--- Login page ---"
$r = Invoke-WebRequest -Uri 'http://localhost:3000/login' -UseBasicParsing
Write-Host ("Status: " + $r.StatusCode)

Write-Host "`n--- Register page ---"
$r = Invoke-WebRequest -Uri 'http://localhost:3000/register' -UseBasicParsing
Write-Host ("Status: " + $r.StatusCode)

Write-Host "`n--- Lost items page ---"
$r = Invoke-WebRequest -Uri 'http://localhost:3000/lost' -UseBasicParsing
Write-Host ("Status: " + $r.StatusCode)

Write-Host "`n--- Found items page ---"
$r = Invoke-WebRequest -Uri 'http://localhost:3000/found' -UseBasicParsing
Write-Host ("Status: " + $r.StatusCode)

Write-Host "`n--- Admin page (expect redirect/403) ---"
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3000/admin' -UseBasicParsing -MaximumRedirection 0
  Write-Host ("Status: " + $r.StatusCode)
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  Write-Host ("Status: " + $statusCode)
}

Write-Host "`n--- Public APIs ---"
$recent = Invoke-RestMethod -Uri 'http://localhost:3000/api/items/recent'
Write-Host ("Recent items count: " + ($recent.items | Measure-Object | Select-Object -ExpandProperty Count))

$lost = Invoke-RestMethod -Uri 'http://localhost:3000/api/items/lost'
Write-Host ("Lost items count: " + ($lost.items | Measure-Object | Select-Object -ExpandProperty Count))

$found = Invoke-RestMethod -Uri 'http://localhost:3000/api/items/found'
Write-Host ("Found items count: " + ($found.items | Measure-Object | Select-Object -ExpandProperty Count))

Write-Host "`n=== Smoke test complete ==="
