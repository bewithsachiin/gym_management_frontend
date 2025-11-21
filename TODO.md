# Restrict ManageStaff to User's Branch

## Tasks
- [ ] Modify fetchStaff to filter by user's branchId: axiosInstance.get(`/staff?branchId=${branchId}`)
- [ ] In handleFormSubmit, force apiData.branchId = branchId; (ignore formData.branchId)
- [ ] Remove branch selection field from form (since fixed to user's branch)
- [ ] Update header description to indicate branch restriction
- [ ] Test fetching staff (should only show user's branch staff)
- [ ] Test adding staff (should assign to user's branch)
- [ ] Test editing staff (only user's branch staff editable)
