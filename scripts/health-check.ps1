$healthUrl = "http://localhost:5000/api/health"

Write-Host "Checking application health..."

try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get

    if ($response.status -eq "ok") {
        Write-Host "Application is healthy."
        Write-Host "Service: $($response.service)"
        Write-Host "Database: $($response.databaseMode)"
        exit 0
    }
    else {
        Write-Host "Application is unhealthy."
        exit 1
    }
}
catch {
    Write-Host "Health check failed."
    Write-Host $_.Exception.Message
    exit 1
}