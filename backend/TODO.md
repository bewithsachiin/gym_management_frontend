# Fix PrismaClientValidationError for Staff Creation/Update

## Issue
- User model requires `password` as `String` (not optional)
- When `loginEnabled` is false, `hashedPassword` is set to `null`
- This causes `PrismaClientValidationError` in `prisma.user.create()` and `prisma.user.update()`

## Plan
1. Modify password handling in `createStaff` to always provide a hashed password
   - If `loginEnabled` is true and password provided: hash the provided password
   - If `loginEnabled` is true but no password: throw error (require password for login)
   - If `loginEnabled` is false: hash a dummy password (e.g., "dummy123")

2. Modify password handling in `updateStaff` similarly
   - Ensure password is never set to null in User update

3. Test the fix by running the staff creation endpoint

## Files to Edit
- `src/services/staffService.js`
