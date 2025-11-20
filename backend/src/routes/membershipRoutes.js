const express = require('express');
const membershipController = require('../controllers/membershipController');
const router = express.Router();

// Routes for memberships
router.get('/', membershipController.getAllMemberships);
router.get('/:id', membershipController.getMembershipById);
router.post('/', membershipController.createMembership);
router.put('/:id', membershipController.updateMembership);
router.delete('/:id', membershipController.deleteMembership);

module.exports = router;
