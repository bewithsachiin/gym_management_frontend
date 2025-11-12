# PowerShell script to test member API endpoints using Invoke-WebRequest

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

$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Test Member APIs

# GET /api/v1/members
Write-Host "`nTesting GET /api/v1/members..."
$getMembersResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/members" -Method GET -Headers $headers
Write-Host "Status: $($getMembersResponse.StatusCode)"
Write-Host "Response: $($getMembersResponse.Content)"

# POST /api/v1/members (create new member)
Write-Host "`nTesting POST /api/v1/members..."
$postMemberBody = @{
    first_name = "John"
    last_name = "Doe"
    email = "john.doe$(Get-Random -Minimum 1000 -Maximum 9999)@test.com"
    password = "password123"
    branchId = 1  # Assuming branch ID 1 exists
} | ConvertTo-Json

$postMemberResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/members" -Method POST -Headers $headers -Body $postMemberBody -ContentType "application/json"
Write-Host "Status: $($postMemberResponse.StatusCode)"
$postMemberData = $postMemberResponse.Content | ConvertFrom-Json
$memberId = $postMemberData.data.member.id
Write-Host "Created member ID: $memberId"
Write-Host "Response: $($postMemberResponse.Content)"

# PUT /api/v1/members/:id (update member)
Write-Host "`nTesting PUT /api/v1/members/$memberId..."
$putMemberBody = @{
    first_name = "Jane"
    last_name = "Doe"
    email = "jane.doe@test.com"
    branchId = 1
} | ConvertTo-Json

$putMemberResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/members/$memberId" -Method PUT -Headers $headers -Body $putMemberBody -ContentType "application/json"
Write-Host "Status: $($putMemberResponse.StatusCode)"
Write-Host "Response: $($putMemberResponse.Content)"

# DELETE /api/v1/members/:id (delete member)
Write-Host "`nTesting DELETE /api/v1/members/$memberId..."
$deleteMemberResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/members/$memberId" -Method DELETE -Headers $headers
Write-Host "Status: $($deleteMemberResponse.StatusCode)"
Write-Host "Response: $($deleteMemberResponse.Content)"

Write-Host "`nAll member API tests completed."
