import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaCalendarAlt, FaTag, FaMoneyBillWave, FaStar, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';

const MembershipPlans = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // For Add Custom Feature Modal
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  // Sample data
  const [plans, setPlans] = useState([
    {
      id: 1,
      plan_name: "Basic Monthly",
      plan_description: "Access to gym floor and cardio machines only.",
      duration_days: 30,
      price_cents: 15000, // ₹150
      currency: "INR",
      features: ["Cardio Access", "Locker Room"],
      status: "Active"
    },
    {
      id: 2,
      plan_name: "Premium Annual",
      plan_description: "Full access including group classes, sauna, and personal training.",
      duration_days: 365,
      price_cents: 120000, // ₹1200
      currency: "INR",
      features: ["Sauna", "Group Classes", "Personal Training", "Locker Room"],
      status: "Active"
    },
    {
      id: 3,
      plan_name: "Student Plan",
      plan_description: "Discounted access for students during off-peak hours.",
      duration_days: 90,
      price_cents: 30000, // ₹300
      currency: "INR",
      features: ["Cardio Access", "Group Classes"],
      status: "Inactive"
    }
  ]);
  
  const [allFeatures, setAllFeatures] = useState([
    "Sauna", 
    "Group Classes", 
    "Personal Training", 
    "Locker Room", 
    "Cardio Access", 
    "Swimming Pool"
  ]);

  const handleAddNew = () => {
    setModalType('add');
    setSelectedPlan(null);
    setIsModalOpen(true);
  };
  
  const handleView = (plan) => {
    setModalType('view');
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };
  
  const handleEdit = (plan) => {
    setModalType('edit');
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedPlan) {
      setPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
      alert(`Plan "${selectedPlan.plan_name}" has been deleted.`);
    }
    setIsDeleteModalOpen(false);
    setSelectedPlan(null);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPlan(null);
  };

  // Add Feature Modal Handlers
  const openAddFeatureModal = () => {
    setNewFeature('');
    setIsAddFeatureModalOpen(true);
  };

  const closeAddFeatureModal = () => {
    setIsAddFeatureModalOpen(false);
    setNewFeature('');
  };

  const saveNewFeature = () => {
    if (!newFeature.trim()) {
      alert("Feature name cannot be empty.");
      return;
    }
    if (allFeatures.includes(newFeature.trim())) {
      alert("This feature already exists.");
      return;
    }
    setAllFeatures(prev => [...prev, newFeature.trim()]);
    // Optionally auto-check it for current plan in edit mode
    closeAddFeatureModal();
  };
  
  // Prevent background scroll
  React.useEffect(() => {
    if (isModalOpen || isDeleteModalOpen || isAddFeatureModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen, isAddFeatureModalOpen]);
  
  const getStatusBadge = (status) => {
    const badgeClasses = {
      Active: "bg-success-subtle text-success-emphasis",
      Inactive: "bg-danger-subtle text-danger-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };
  
  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Membership Plan';
      case 'edit': return 'Edit Membership Plan';
      case 'view': return 'Membership Plan Details';
      default: return 'Membership Plan';
    }
  };
  
  const formatPrice = (cents) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(cents / 100);
  };
  
  const formatDuration = (days) => {
    if (days >= 365) return `${Math.floor(days / 365)} Year${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} Month${days >= 60 ? 's' : ''}`;
    return `${days} Day${days !== 1 ? 's' : ''}`;
  };
  
  // Component for the view modal content
  const PlanViewContent = ({ plan }) => {
    if (!plan) return null;
    
    return (
      <div className="plan-view-content">
        {/* Header Section */}
        <div className="text-center mb-4 pb-3 border-bottom">
          <h3 className="mb-1">{plan.plan_name}</h3>
          <p className="text-muted mb-2">{plan.plan_description}</p>
          <div className="mt-2">
            {getStatusBadge(plan.status)}
          </div>
        </div>
        
        {/* Plan Details */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-light p-3 me-3">
                  <FaCalendarAlt className="text-primary fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Duration</h6>
                  <p className="mb-0 fw-bold">{formatDuration(plan.duration_days)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle bg-light p-3 me-3">
                  <FaMoneyBillWave className="text-success fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Price</h6>
                  <p className="mb-0 fw-bold">{formatPrice(plan.price_cents)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center mb-3">
              <FaStar className="text-warning me-2" /> Plan Features
            </h5>
            <div className="row g-2">
              {plan.features.length > 0 ? (
                plan.features.map((feature, index) => (
                  <div className="col-12 col-md-6" key={index}>
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <FaTag className="text-primary me-2" />
                      <span className="fw-medium">{feature}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <p className="text-muted text-center mb-0">No features available for this plan</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status Information */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center mb-3">
              {plan.status === 'Active' ? 
                <FaToggleOn className="text-success me-2 fs-4" /> : 
                <FaToggleOff className="text-danger me-2 fs-4" />
              }
              Plan Status
            </h5>
            <div className="d-flex align-items-center">
              {getStatusBadge(plan.status)}
              <span className="ms-3">
                {plan.status === 'Active' ? 
                  'This plan is currently available for new members' : 
                  'This plan is not available for new members'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8 mb-3 mb-lg-0">
          <h2 className="fw-bold h3 h2-md">Membership Plans</h2>
          <p className="text-muted mb-0">Create and manage membership plans for your gym.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end">
          <button
            className="btn w-90 col-lg-6 col-12"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleAddNew}
          >
            <i className="fas fa-plus fs-4 text-light"></i> Add New Plan
          </button>
        </div>
      </div>
      
      {/* Search & Actions */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <input
              type="text"
              className="form-control border"
              placeholder="Search plans..."
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-filter me-1"></i> Filter
          </button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-file-export me-1"></i> Export
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold">PLAN NAME</th>
                <th className="fw-semibold">DURATION</th>
                <th className="fw-semibold">PRICE</th>
                <th className="fw-semibold">FEATURES</th>
                <th className="fw-semibold">STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong>{plan.plan_name}</strong>
                    <div><small className="text-muted">{plan.plan_description}</small></div>
                  </td>
                  <td>{formatDuration(plan.duration_days)}</td>
                  <td>{formatPrice(plan.price_cents)}</td>
                  <td>
                    <small>
                      {plan.features.slice(0, 2).join(', ')}
                      {plan.features.length > 2 && ` +${plan.features.length - 2} more`}
                    </small>
                  </td>
                  <td>{getStatusBadge(plan.status)}</td>
                  <td className="text-center">
                    <div className="d-flex flex-row justify-content-center gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="View"
                        onClick={() => handleView(plan)}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Edit"
                        onClick={() => handleEdit(plan)}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                        onClick={() => handleDeleteClick(plan)}
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* MAIN MODAL (Add/Edit/View) */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                {modalType === 'view' ? (
                  <PlanViewContent plan={selectedPlan} />
                ) : (
                  <form>
                    {/* Plan Name */}
                    <div className="mb-3">
                      <label className="form-label">Plan Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g., Premium Annual Plan"
                        defaultValue={selectedPlan?.plan_name || ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="3"
                        placeholder="Describe benefits, limitations, etc."
                        defaultValue={selectedPlan?.plan_description || ''}
                        readOnly={modalType === 'view'}
                      ></textarea>
                    </div>
                    {/* Duration */}
                    <div className="mb-3">
                      <label className="form-label">Duration (Days) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        placeholder="e.g., 30, 90, 365"
                        defaultValue={selectedPlan?.duration_days || ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    {/* Price */}
                    <div className="mb-3">
                      <label className="form-label">Price (₹) <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control rounded-3"
                          placeholder="Enter price in rupees"
                          defaultValue={selectedPlan ? selectedPlan.price_cents / 100 : ''}
                          readOnly={modalType === 'view'}
                          required
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <input type="hidden" name="currency" defaultValue="INR" />
                      <small className="text-muted">Stored internally as cents (e.g., ₹150 = 15000 cents)</small>
                    </div>
                    {/* Features */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-semibold mb-0">Features</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={openAddFeatureModal}
                        >
                          <FaPlus size={12} className="me-1" /> Add Feature
                        </button>
                      </div>
                      <div className="row g-2">
                        {allFeatures.map(feature => (
                          <div className="col-12 col-md-6" key={feature}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`feature-${feature}`}
                                defaultChecked={selectedPlan?.features?.includes(feature)}
                                disabled={modalType === 'view'}
                              />
                              <label className="form-check-label" htmlFor={`feature-${feature}`}>
                                {feature}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Status Toggle */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center">
                        <label className="form-label me-3 mb-0">Status</label>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="statusToggle"
                            defaultChecked={selectedPlan?.status === 'Active'}
                            disabled={modalType === 'view'}
                          />
                          <label className="form-check-label ms-2" htmlFor="statusToggle">
                            {selectedPlan?.status === 'Active' ? 'Active' : 'Inactive'}
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* Buttons */}
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      {modalType !== 'view' && (
                        <button
                          type="button"
                          className="btn"
                          style={{
                            backgroundColor: '#6EB2CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: '500',
                          }}
                          onClick={() => {
                            alert(`${modalType === 'add' ? 'New plan added' : 'Plan updated'} successfully!`);
                            closeModal();
                          }}
                        >
                          {modalType === 'add' ? 'Save Plan' : 'Update Plan'}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ADD CUSTOM FEATURE MODAL */}
      {isAddFeatureModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeAddFeatureModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Add New Feature</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAddFeatureModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Feature Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Nutrition Counseling"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    autoFocus
                  />
                </div>
                <small className="text-muted">This feature will be available for all membership plans.</small>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeAddFeatureModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#03a1e0ff', border: 'none' }}
                  onClick={saveNewFeature}
                >
                  Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete <strong>{selectedPlan?.plan_name}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;