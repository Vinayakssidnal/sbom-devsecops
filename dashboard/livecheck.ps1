Set-Location 'C:\Users\vinay\OneDrive\Documents\Projects\DevSecOps\sbom-devsecops'
$urls = @(
    'http://localhost:4000/dashboard/index.html',
    'http://localhost:4000/dashboard/style.css',
    'http://localhost:4000/dashboard/app.js'
)
foreach ($u in $urls) {
    Write-Host "--- $u ---"
    try {
        $resp = Invoke-WebRequest -Uri $u -UseBasicParsing -ErrorAction Stop
        $resp.Content.Split('`n')[0..19] | ForEach-Object { Write-Host $_ }
    } catch {
        Write-Host "ERR $u $($_.Exception.Message)"
    }
}
