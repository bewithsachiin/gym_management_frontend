import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Alert, Spinner } from "react-bootstrap";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from "../../../utils/axiosInstance";

const RoleManagement = () => {
  // State management
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit"); // 'edit', 'view', 'add'
  const [editingRole, setEditingRole] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles based on status
  useEffect(() => {
    if (filter === "All") {
      setFilteredRoles(roles);
    } else {
      setFilteredRoles(roles.filter((role) => role.status === filter));
    }
  }, [roles, filter]);

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/staff-roles');
      
      if (response.data && response.data.success) {
        setRoles(response.data.data.roles);
      } else {
        throw new Error(response.data?.message || "Failed to fetch roles");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  // Handle showing modal with appropriate mode
  const handleShowModal = (role = null, mode = "edit") => {
    setEditingRole(role);
    setModalMode(mode);
    setShowModal(true);
  };

  // Close modal and reset editing role
  const handleCloseModal = () => {
    setEditingRole(null);
    setShowModal(false);
  };

  // Save or update role
  const handleSaveRole = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract form data
      const form = e?.target || document.querySelector('#roleForm');
      if (!form) throw new Error("Form not found");
      
      const formData = {
        name: form.roleName.value,
        description: form.description.value,
        permissions: {
          dashboard: form.dashboard.checked,
          members: form.members.checked,
          staff: form.staff.checked,
          finance: form.finance.checked,
          settings: form.settings.checked
        },
        status: form.status.value
      };
      
      let response;
      
      if (editingRole && editingRole.id) {
        // Update existing role
        response = await axiosInstance.put(`/staff-roles/${editingRole.id}`, formData);
        setApiSuccess("Role updated successfully");
      } else {
        // Create new role
        response = await axiosInstance.post('/staff-roles', formData);
        setApiSuccess("Role created successfully");
      }
      
      if (response.data && response.data.success) {
        // Refresh roles list
        await fetchRoles();
        handleCloseModal();
      } else {
        throw new Error(response.data?.message || "Failed to save role");
      }
    } catch (err) {
      console.error("Error saving role:", err);
      setError(err.response?.data?.message || err.message || "Failed to save role");
    } finally {
      setLoading(false);
      // Clear success message after 3 seconds
      if (apiSuccess) {
        setTimeout(() => setApiSuccess(null), 3000);
      }
    }
  };

  // Handle delete role click
  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  // Confirm delete role
  const confirmDelete = async () => {
    if (!roleToDelete) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.delete(`/staff-roles/${roleToDelete.id}`);
      
      if (response.data && response.data.success) {
        // Remove role from state
        setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        setApiSuccess("Role deleted successfully");
      } else {
        throw new Error(response.data?.message || "Failed to delete role");
      }
    } catch (err) {
      console.error("Error deleting role:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete role");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
      // Clear success message after 3 seconds
      if (apiSuccess) {
        setTimeout(() => setApiSuccess(null), 3000);
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  // Convert permissions object to array for display
  const getPermissionsArray = (permissions) => {
    if (!permissions) return [];
    
    return Object.entries(permissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission]) => permission.charAt(0).toUpperCase() + permission.slice(1));
  };

  // Get initial permission values for form
  const getInitialPermissions = (permissions) => {
    return {
      dashboard: permissions?.dashboard || false,
      members: permissions?.members || false,
      staff: permissions?.staff || false,
      finance: permissions?.finance || false,
      settings: permissions?.settings || false
    };
  };

  return (
    <div className="">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <h2 style={{ color: "#2f6a87" }} className="mb-3 mb-md-0">Role Management</h2>

        {/* Add Role Button */}
        <Button
          onClick={() => handleShowModal(null, "edit")}
          style={{ backgroundColor: "#2f6a87", border: "none" }}
          className="px-4"
          disabled={loading}
        >
          Add Role
        </Button>
      </div>

      {/* Alert for errors and success messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {apiSuccess && (
        <Alert variant="success" dismissible onClose={() => setApiSuccess(null)}>
          {apiSuccess}
        </Alert>
      )}

      {/* Filter Buttons as text links */}
      <div className="mb-4">
        {["All", "Active", "Inactive"].map((f) => (
          <span
            key={f}
            onClick={() => setFilter(f)}
            style={{
              cursor: "pointer",
              color: filter === f ? "#2f6a87" : "#555",
              fontWeight: filter === f ? "bold" : "normal",
              marginRight: "15px",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Roles Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Table bordered hover className="align-middle mb-0">
            <thead style={{ backgroundColor: "#2f6a87", color: "#fff" }}>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Status</th>
                <th className="text-center" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.description}</td>
                    <td>
                      {getPermissionsArray(role.permissions).map((perm, index) => (
                        <Badge
                          key={index}
                          style={{
                            backgroundColor: '#2f6a87',
                            color: '#ffffff',
                            padding: '3px 5px',
                            fontSize: '0.85em',
                            fontWeight: '500',
                            borderRadius: '4px',
                          }}
                          className="me-2 mb-3"
                        >
                          {perm}
                        </Badge>
                      ))}
                    </td>
                    <td>
                      <Badge
                        style={{
                          backgroundColor: role.status === "Active" ? "green" : "red",
                          color: '#ffffff',
                          padding: '0.35em 0.7em',
                          fontSize: '0.85em',
                          fontWeight: '500',
                          borderRadius: '4px',
                        }}
                        className="me-2 mb-2"
                      >
                        {role.status}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          title="View"
                          onClick={() => handleShowModal(role, "view")}
                          disabled={loading}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          title="Edit"
                          onClick={() => handleShowModal(role, "edit")}
                          disabled={loading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDeleteClick(role)}
                          disabled={loading}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Add/Edit/View Role Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header style={{ backgroundColor: "#2f6a87", color: "#fff" }} closeButton>
          <Modal.Title>
            {modalMode === "add" || !editingRole
              ? "Add Role"
              : modalMode === "view"
                ? "View Role"
                : "Edit Role"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="roleForm" onSubmit={handleSaveRole}>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                name="roleName"
                placeholder="Enter role name"
                defaultValue={editingRole?.name || ""}
                readOnly={modalMode === "view"}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                placeholder="Enter description"
                defaultValue={editingRole?.description || ""}
                readOnly={modalMode === "view"}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {[
                  { key: "dashboard", label: "Dashboard" },
                  { key: "members", label: "Members" },
                  { key: "staff", label: "Staff" },
                  { key: "finance", label: "Finance" },
                  { key: "settings", label: "Settings" }
                ].map((perm) => (
                  <Form.Check
                    key={perm.key}
                    type="checkbox"
                    name={perm.key}
                    label={perm.label}
                    defaultChecked={getInitialPermissions(editingRole?.permissions)[perm.key]}
                    disabled={modalMode === "view"}
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                defaultValue={editingRole?.status || "Active"}
                disabled={modalMode === "view"}
              >
                <option>Active</option>
                <option>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {modalMode === "view" ? "Close" : "Cancel"}
          </Button>
          {modalMode !== "view" && (
            <Button
              variant="info"
              style={{ backgroundColor: "#2f6a87", border: "none" }}
              type="submit"
              form="roleForm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Loading...</span>
                </>
              ) : (
                editingRole ? "Update Role" : "Add Role"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal show={showDeleteConfirm} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the role <strong>"{roleToDelete?.name}"</strong>?<br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="visually-hidden">Loading...</span>
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoleManagement;