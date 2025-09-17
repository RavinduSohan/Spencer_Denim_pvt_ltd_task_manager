$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    firstName = "John"
    lastName = "Doe"
    email = "john.doe@test.com"
    department = "Engineering"
    position = "Developer"
    salary = 75000
    hireDate = "2024-01-15"
    isActive = $true
    notes = "Test employee"
} | ConvertTo-Json

Write-Host "Testing Dynamic Tables API..."
Write-Host "Request Body:" $body

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/tables/employees" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $responseBody = $_.Exception.Response.GetResponseStream()
        $reader = [System.IO.StreamReader]::new($responseBody)
        $errorText = $reader.ReadToEnd()
        Write-Host "Response:" $errorText
    }
}