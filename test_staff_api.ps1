# PowerShell script to test staff and staffRole API endpoints using Invoke-WebRequest

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

# Step 2: Test StaffRole APIs

# GET /api/v1/staff-roles
Write-Host "`nTesting GET /api/v1/staff-roles..."
$getRolesResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff-roles" -Method GET -Headers $headers
Write-Host "Status: $($getRolesResponse.StatusCode)"
Write-Host "Response: $($getRolesResponse.Content)"

# POST /api/v1/staff-roles (create new staffRole)
Write-Host "`nTesting POST /api/v1/staff-roles..."
$postRoleBody = @{
    name = "Test Role"
    description = "Test Description"
} | ConvertTo-Json

$postRoleResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff-roles" -Method POST -Headers $headers -Body $postRoleBody -ContentType "application/json"
Write-Host "Status: $($postRoleResponse.StatusCode)"
$postRoleData = $postRoleResponse.Content | ConvertFrom-Json
$roleId = $postRoleData.data.role.id
Write-Host "Created role ID: $roleId"
Write-Host "Response: $($postRoleResponse.Content)"

# PUT /api/v1/staff-roles/:id (update staffRole)
Write-Host "`nTesting PUT /api/v1/staff-roles/$roleId..."
$putRoleBody = @{
    name = "Updated Test Role"
    description = "Updated Test Description"
} | ConvertTo-Json

$putRoleResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff-roles/$roleId" -Method PUT -Headers $headers -Body $putRoleBody -ContentType "application/json"
Write-Host "Status: $($putRoleResponse.StatusCode)"
Write-Host "Response: $($putRoleResponse.Content)"

# Step 3: Test Staff APIs

# GET /api/v1/staff
Write-Host "`nTesting GET /api/v1/staff..."
$getStaffResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff" -Method GET -Headers $headers
Write-Host "Status: $($getStaffResponse.StatusCode)"
Write-Host "Response: $($getStaffResponse.Content)"

# POST /api/v1/staff (create new staff)
Write-Host "`nTesting POST /api/v1/staff..."
$postStaffBody = @{
    first_name = "John"
    last_name = "Doe"
    gender = "Male"
    dob = "1990-01-01"
    email = "john.doe$(Get-Random -Minimum 1000 -Maximum 9999)@test.com"
    phone = "1234567890"
    status = "Active"
    roleId = $roleId
    branchId = 1  # Assuming branch ID 1 exists
    join_date = "2023-01-01"
    salary_type = "Fixed"
    fixed_salary = 50000
    commission_rate_percent = 5
    login_enabled = $true
    username = "johndoe$(Get-Random -Minimum 1000 -Maximum 9999)"
    password = "password123"
} | ConvertTo-Json

$postStaffResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff" -Method POST -Headers $headers -Body $postStaffBody -ContentType "application/json"
Write-Host "Status: $($postStaffResponse.StatusCode)"
$postStaffData = $postStaffResponse.Content | ConvertFrom-Json
$staffId = $postStaffData.data.staff.id
Write-Host "Created staff ID: $staffId"
Write-Host "Response: $($postStaffResponse.Content)"

# PUT /api/v1/staff/:id (update staff)
Write-Host "`nTesting PUT /api/v1/staff/$staffId..."
$putStaffBody = @{
    first_name = "Jane"
    last_name = "Doe"
    gender = "Female"
    dob = "1992-02-02"
    email = "jane.doe@test.com"
    phone = "0987654321"
    status = "Active"
    roleId = $roleId
    branchId = 1
    join_date = "2023-01-01"
    salary_type = "Fixed"
    fixed_salary = 55000
    commission_rate_percent = 5
    login_enabled = $true
    username = "janedoe"
    password = "password123"
} | ConvertTo-Json

$putStaffResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff/$staffId" -Method PUT -Headers $headers -Body $putStaffBody -ContentType "application/json"
Write-Host "Status: $($putStaffResponse.StatusCode)"
Write-Host "Response: $($putStaffResponse.Content)"

# DELETE /api/v1/staff/:id (delete staff)
Write-Host "`nTesting DELETE /api/v1/staff/$staffId..."
$deleteStaffResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff/$staffId" -Method DELETE -Headers $headers
Write-Host "Status: $($deleteStaffResponse.StatusCode)"
Write-Host "Response: $($deleteStaffResponse.Content)"

# DELETE /api/v1/staff-roles/:id (delete staffRole)
Write-Host "`nTesting DELETE /api/v1/staff-roles/$roleId..."
$deleteRoleResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/staff-roles/$roleId" -Method DELETE -Headers $headers
Write-Host "Status: $($deleteRoleResponse.StatusCode)"
Write-Host "Response: $($deleteRoleResponse.Content)"

Write-Host "`nAll staff and staffRole API tests completed."
