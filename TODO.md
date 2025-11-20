# TODO: Update Prisma Schema for Name Consistency

## Overview
Convert all field names in `backend/src/prisma/schema.prisma` from inconsistent naming (mix of camelCase and snake_case) to consistent camelCase. This ensures uniformity and aligns with Prisma's conventions.

## Steps to Complete

### 1. Update Field Names in Schema
- [ ] Go through each model and change snake_case fields to camelCase.
- [ ] Examples:
  - `profile_photo` → `profilePhoto`
  - `plan_name` → `planName`
  - `plan_description` → `planDescription`
  - `duration_days` → `durationDays`
  - `price_cents` → `priceCents`
  - `branch_image` → `branchImage`
  - `total_sheets` → `totalSheets`
  - `schedule_day` → `scheduleDay`
  - `join_date` → `joinDate`
  - `exit_date` → `exitDate`
  - `salary_type` → `salaryType`
  - `hourly_rate` → `hourlyRate`
  - `fixed_salary` → `fixedSalary`
  - `commission_rate_percent` → `commissionRatePercent`
  - `login_enabled` → `loginEnabled`
  - `staff_id` → `staffId`
  - `class_name` → `className`
  - `trainer_id` → `trainerId`
  - `adminId` → `adminId` (already camelCase, but ensure consistency)c
  - `payment_status` → `paymentStatus`
  - `preferred_membership_plan` → `preferredMembershipPlan`
  - `interested_in` → `interestedIn`
  - `preferred_time` → `preferredTime`
  - `registered_at` → `registeredAt`
  - `created_by` → `createdBy`
  - `created_at` → `createdAt`
  - `updated_at` → `updatedAt`
  - `scanned_at` → `scannedAt`
  - `issued_at` → `issuedAt`
  - `expires_at` → `expiresAt`
  - `check_in_time` → `checkInTime`
  - `check_out_time` → `checkOutTime`
  - `total_hours` → `totalHours`
  - `remaining_sessions` → `remainingSessions`
  - `sessions_used` → `sessionsUsed`
  - `requested_at` → `requestedAt`
  - `start_date` → `startDate`
  - `expiry_date` → `expiryDate`
  - `end_date` → `endDate`
  - `paid_amount` → `paidAmount`
  - `due_amount` → `dueAmount`
  - `payment_status` → `paymentStatus`
- [ ] Update relation fields and references accordingly (e.g., `User_branchId_fkey` might need adjustment, but Prisma handles it).
- [ ] Ensure enum names are consistent if needed (they seem fine).

### 2. Generate Prisma Client
- [ ] Run `npx prisma generate` in the backend directory to update the Prisma client with new field names.

### 3. Update Backend Code References
- [ ] Search for old field names in backend controllers, services, and routes.
- [ ] Update any code that accesses these fields (e.g., in `memberController.js`, `memberService.js`, etc.).
- [ ] Use grep or search_files to find usages like `profile_photo`, `plan_name`, etc.

### 4. Update Frontend Code if Necessary
- [ ] Check if frontend code directly accesses these fields (unlikely, but possible in API responses).
- [ ] Update any hardcoded field names in frontend components.

### 5. Test and Validate
- [ ] Run the application and test member management, plan creation, etc.
- [ ] Ensure database migrations are handled (if needed, run `npx prisma migrate dev`).
- [ ] Verify that all CRUD operations work with the new field names.

### 6. Final Review
- [ ] Review the entire schema for any missed fields.
- [ ] Ensure no breaking changes in relations or constraints.
