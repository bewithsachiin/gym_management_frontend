import React, { useState } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Admin",
      description: "Full access to all features",
      permissions: ["Dashboard", "Manage Users", "Reports"],
      status: "Active",
    },
    {
      id: 2,
      name: "Manager",
      description: "Manage team and view reports",
      permissions: ["Dashboard", "Manage Members", "Reports"],
      status: "Active",
    },
    {
      id: 3,
      name: "Receptionist",
      description: "Manage check-ins and payments",
      permissions: ["Attendance", "Payments"],
      status: "Inactive",
    },
  ]);

  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit"); // 'edit', 'view', 'add'
  const [editingRole, setEditingRole] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const filteredRoles =
    filter === "All" ? roles : roles.filter((role) => role.status === filter);

  const handleShowModal = (role = null, mode = "edit") => {
    setEditingRole(role);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingRole(null);
    setShowModal(false);
  };

  const handleSaveRole = () => {
    // For demo: just close modal
    // In real app, you'd update state here
    setShowModal(false);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
    }
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
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
        >
          Add Role
        </Button>
      </div>

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
            {filteredRoles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>
                  {role.permissions.map((perm, index) => (
                    <badge
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
                    </badge>
                  ))}
                </td>
                <td>
                  <badge
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
                  </badge>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      title="View"
                      onClick={() => handleShowModal(role, "view")}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      title="Edit"
                      onClick={() => handleShowModal(role, "edit")}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Delete"
                      onClick={() => handleDeleteClick(role)}
                    >
                      <FaTrashAlt />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter role name"
                defaultValue={editingRole?.name || ""}
                readOnly={modalMode === "view"}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                defaultValue={editingRole?.description || ""}
                readOnly={modalMode === "view"}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {["Dashboard", "Manage Users", "Reports", "Payments", "Attendance"].map((perm) => (
                  <Form.Check
                    key={perm}
                    type="checkbox"
                    label={perm}
                    defaultChecked={editingRole?.permissions?.includes(perm)}
                    disabled={modalMode === "view"}
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
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
              onClick={handleSaveRole}
            >
              {editingRole ? "Update Role" : "Add Role"}
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
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RoleManagement;