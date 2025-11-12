# PowerShell script to test branch API endpoints using Invoke-WebRequest

$baseUrl = "http://localhost:5000"

# Step 1: Login to get JWT token
Write-Host "Logging in as superadmin..."
$loginBody = @{
    email = "superadmin@fit.com"
    password = "superadmin123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token
Write-Host "Login successful. Token: $token"

# Step 2: GET /api/branches
Write-Host "`nTesting GET /api/branches..."
$headers = @{
    "Authorization" = "Bearer $token"
}
$getResponse = Invoke-WebRequest -Uri "$baseUrl/api/branches" -Method GET -Headers $headers
Write-Host "Status: $($getResponse.StatusCode)"
Write-Host "Response: $($getResponse.Content)"

# Step 3: POST /api/branches (create new branch)
Write-Host "`nTesting POST /api/branches..."
$postBody = @{
    name = "Test Branch"
    code = "TB001"
    address = "123 Test St"
    hours = @{"open" = "06:00"; "close" = "22:00"}
    adminId = 1
} | ConvertTo-Json

$postResponse = Invoke-WebRequest -Uri "$baseUrl/api/branches" -Method POST -Headers $headers -Body $postBody -ContentType "application/json"
Write-Host "Status: $($postResponse.StatusCode)"
$postData = $postResponse.Content | ConvertFrom-Json
$branchId = $postData.data.branch.id
Write-Host "Created branch ID: $branchId"
Write-Host "Response: $($postResponse.Content)"

# Step 4: PUT /api/branches/:id (update branch)
Write-Host "`nTesting PUT /api/branches/$branchId..."
$putBody = @{
    name = "Updated Test Branch"
} | ConvertTo-Json

$putResponse = Invoke-WebRequest -Uri "$baseUrl/api/branches/$branchId" -Method PUT -Headers $headers -Body $putBody -ContentType "application/json"
Write-Host "Status: $($putResponse.StatusCode)"
Write-Host "Response: $($putResponse.Content)"

# Step 5: DELETE /api/branches/:id (delete branch)
Write-Host "`nTesting DELETE /api/branches/$branchId..."
$deleteResponse = Invoke-WebRequest -Uri "$baseUrl/api/branches/$branchId" -Method DELETE -Headers $headers
Write-Host "Status: $($deleteResponse.StatusCode)"
Write-Host "Response: $($deleteResponse.Content)"

Write-Host "`nAll branch API tests completed."
