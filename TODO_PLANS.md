# TODO: Integrate SuperAdmin Plans with Backend API

## Backend Changes
- [ ] Update Plan model in schema.prisma: Add features Json field, plan_description String field
- [ ] Update planService.js: Handle features array, map data correctly (plan_name -> name, duration_days -> validity, etc.), ensure superadmin creates global plans
- [ ] Update planController.js: Adjust for new fields and data mapping

## Frontend Changes
- [ ] Update Plans.jsx: Add state for plans, loading, error, search, filter, features
- [ ] Add useEffect to fetch plans and features on mount
- [ ] Implement search and filter functionality
- [ ] Update form: Handle features checkboxes, proper data mapping
- [ ] Add API calls for fetch plans/features, create, update, delete, toggle status
- [ ] Handle form submission with proper data mapping (features array, status boolean)
- [ ] Add loading states and error handling
- [ ] Refresh plans list after CRUD operations
- [ ] Map backend data to frontend format (name -> plan_name, validity -> duration_days, etc.)

## Testing
- [x] Added console logs for debugging API responses and form data
- [x] Updated Plan model with features and plan_description fields
- [x] Updated planService to handle new fields and data mapping
- [x] Updated Plans.jsx with API integration, search/filter, CRUD operations
- [x] Added form field names and proper data handling
- [ ] Test fetching plans and features
- [ ] Test creating plan with features
- [ ] Test updating plan
- [ ] Test deleting plan
- [ ] Test status toggle
- [ ] Test search and filter
- [ ] Handle edge cases (API errors, empty responses)
