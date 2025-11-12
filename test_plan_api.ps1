# Test Plan API Operations
# Login as SuperAdmin first, then test all plan operations

Write-Host "Testing Plan API Operations" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:5000/api/v1"
$loginUrl = "$baseUrl/auth/login"

# SuperAdmin credentials
$loginData = @{
    email = "superadmin@fit.com"
    password = "superadmin123"
} | ConvertTo-Json

Write-Host "1. Logging in as SuperAdmin..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n2. Getting all plans..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-RestMethod -Uri "$baseUrl/plans" -Method GET -Headers $headers
    Write-Host "Found $($plansResponse.data.Count) plans:" -ForegroundColor Green
    $plansResponse.data | ForEach-Object {
        Write-Host "  - $($_.name) (ID: $($_.id), Status: $($_.status))"
    }
} catch {
    Write-Host "Failed to get plans: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Getting all features..." -ForegroundColor Yellow
try {
    $featuresResponse = Invoke-RestMethod -Uri "$baseUrl/plans/features" -Method GET -Headers $headers
    Write-Host "Available features:" -ForegroundColor Green
    $featuresResponse.data | ForEach-Object {
        Write-Host "  - $_"
    }
} catch {
    Write-Host "Failed to get features: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Creating a new plan..." -ForegroundColor Yellow
$newPlanData = @{
    name = "Test Premium Plan"
    description = "A test premium membership plan"
    durationDays = 180
    priceCents = 90000  # ₹900
    currency = "INR"
    features = @("Sauna", "Group Classes", "Personal Training")
    status = "Active"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/plans" -Method POST -Headers $headers -Body $newPlanData
    $createdPlanId = $createResponse.data.id
    Write-Host "Plan created successfully! ID: $createdPlanId" -ForegroundColor Green
    Write-Host "Plan details: $($createResponse.data | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to create plan: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n5. Getting the created plan by ID..." -ForegroundColor Yellow
try {
    $planResponse = Invoke-RestMethod -Uri "$baseUrl/plans/$createdPlanId" -Method GET -Headers $headers
    Write-Host "Plan retrieved successfully:" -ForegroundColor Green
    Write-Host "Name: $($planResponse.data.name)" -ForegroundColor Cyan
    Write-Host "Description: $($planResponse.data.description)" -ForegroundColor Cyan
    Write-Host "Duration: $($planResponse.data.durationDays) days" -ForegroundColor Cyan
    Write-Host "Price: ₹$($planResponse.data.priceCents / 100)" -ForegroundColor Cyan
    Write-Host "Features: $($planResponse.data.features -join ', ')" -ForegroundColor Cyan
    Write-Host "Status: $($planResponse.data.status)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to get plan by ID: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. Updating the plan..." -ForegroundColor Yellow
$updateData = @{
    name = "Updated Test Premium Plan"
    description = "An updated test premium membership plan"
    durationDays = 200
    priceCents = 100000  # ₹1000
    features = @("Sauna", "Group Classes", "Personal Training", "Swimming Pool")
    status = "Active"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/plans/$createdPlanId" -Method PUT -Headers $headers -Body $updateData
    Write-Host "Plan updated successfully!" -ForegroundColor Green
    Write-Host "Updated plan details: $($updateResponse.data | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to update plan: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n7. Getting all plans again to verify update..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-RestMethod -Uri "$baseUrl/plans" -Method GET -Headers $headers
    $updatedPlan = $plansResponse.data | Where-Object { $_.id -eq $createdPlanId }
    if ($updatedPlan) {
        Write-Host "Updated plan found in list:" -ForegroundColor Green
        Write-Host "Name: $($updatedPlan.name)" -ForegroundColor Cyan
        Write-Host "Price: ₹$($updatedPlan.priceCents / 100)" -ForegroundColor Cyan
        Write-Host "Duration: $($updatedPlan.durationDays) days" -ForegroundColor Cyan
    } else {
        Write-Host "Updated plan not found in list!" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to get updated plans list: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n8. Deleting the test plan..." -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/plans/$createdPlanId" -Method DELETE -Headers $headers
    Write-Host "Plan deleted successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to delete plan: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n9. Verifying plan deletion..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-RestMethod -Uri "$baseUrl/plans" -Method GET -Headers $headers
    $deletedPlan = $plansResponse.data | Where-Object { $_.id -eq $createdPlanId }
    if ($deletedPlan) {
        Write-Host "ERROR: Plan still exists after deletion!" -ForegroundColor Red
    } else {
        Write-Host "Plan successfully deleted and not found in list." -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to verify deletion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n10. Testing error scenarios..." -ForegroundColor Yellow

# Test getting non-existent plan
Write-Host "Testing GET non-existent plan..." -ForegroundColor Yellow
try {
    $errorResponse = Invoke-RestMethod -Uri "$baseUrl/plans/99999" -Method GET -Headers $headers
    Write-Host "ERROR: Should have failed for non-existent plan!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Correctly returned 404 for non-existent plan." -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test creating plan with duplicate name
Write-Host "Testing duplicate plan name..." -ForegroundColor Yellow
$duplicatePlanData = @{
    name = "Basic Monthly"  # This should already exist from seed
    description = "Duplicate test"
    durationDays = 30
    priceCents = 15000
    currency = "INR"
    features = @("Cardio Access")
    status = "Active"
} | ConvertTo-Json

try {
    $duplicateResponse = Invoke-RestMethod -Uri "$baseUrl/plans" -Method POST -Headers $headers -Body $duplicatePlanData
    Write-Host "ERROR: Should have failed for duplicate name!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "Correctly returned 409 for duplicate plan name." -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Plan API Testing Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
