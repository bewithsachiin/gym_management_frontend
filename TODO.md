# TODO: Fix Staff Create/Update 400 Error

## Issues Identified:
1. **Field Name Mismatch**: Multer expects 'profile_photo' but client sends 'profilePhoto'.
2. **JSON Parsing**: 'user' field is sent as JSON string but service expects object.

## Tasks:
- [ ] Update uploadMiddleware.js to use 'profilePhoto' instead of 'profile_photo'
- [ ] Update staffController.js to parse 'user' field if it's a string
- [ ] Test staff creation and update functionality
