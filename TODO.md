# TODO: Integrate API and Handle Branch Images in SuperAdminBranches.jsx

## Steps to Complete

- [x] Update backend/src/app.js: Change branch routes to '/api/v1/branches' for consistency with axiosInstance baseURL.
- [x] Update frontend/src/Dashboard/SuperAdmin/SuperAdminBranches.jsx: Import axiosInstance, replace axios with axiosInstance, change API URLs to '/branches'.
- [x] Add Authorization header to API calls using token from localStorage.
- [x] Add image column in the branches table with thumbnail display.
- [x] In BranchModal: Add file input for branch image in add/edit modes.
- [x] In BranchModal: Display branch image in view mode.
- [x] Test the integration: Run the app, add/edit branch with image, verify display in table and modal.

## TODO: Integrate API in SuperAdmin Staff.jsx

## Steps to Complete

- [x] Update frontend/src/Dashboard/SuperAdmin/People/Staff.jsx: Ensure axiosInstance is used for API calls.
- [x] Add Authorization header to API calls using token from localStorage.
- [x] Add name attributes to form inputs for proper FormData handling.
- [x] Update form submission logic to properly handle FormData and file uploads.
- [x] Test the integration: Run the app, add/edit staff, verify CRUD operations work.
