import React, { useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const BranchManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [branches, setBranches] = useState([
        {
            id: 1,
            branchName: "Downtown Gym",
            openingHours: "Mon-Sun: 06:00 - 22:00",
            holidayList: ["2025-01-01", "2025-08-15"],
            notifications_enabled: true,
            sms_notifications_enabled: false,
            in_app_notifications_enabled: true,
            notification_message: "Welcome to our Downtown Branch!",
        },
        {
            id: 2,
            branchName: "Uptown Gym",
            openingHours: "Mon-Fri: 05:00 - 23:00",
            holidayList: ["2025-12-25"],
            notifications_enabled: false,
            sms_notifications_enabled: false,
            in_app_notifications_enabled: false,
            notification_message: "",
        },
    ]);

    const [formData, setFormData] = useState({
        id: null,
        branchName: "",
        openingHours: "",
        holidayList: "",
        notifications_enabled: false,
        sms_notifications_enabled: false,
        in_app_notifications_enabled: false,
        notification_message: "",
    });

    const [modalType, setModalType] = useState("add"); // add | edit

    const handleShowModal = (type, branch = null) => {
        setModalType(type);
        if (type === "edit" && branch) {
            setFormData({
                ...branch,
                holidayList: branch.holidayList.join(", "),
            });
        } else {
            setFormData({
                id: null,
                branchName: "",
                openingHours: "",
                holidayList: "",
                notifications_enabled: false,
                sms_notifications_enabled: false,
                in_app_notifications_enabled: false,
                notification_message: "",
            });
        }
        setShowModal(true);
    };

    const handleSave = () => {
        if (modalType === "add") {
            const newBranch = {
                ...formData,
                id: branches.length + 1,
                holidayList: formData.holidayList
                    ? formData.holidayList.split(",").map((h) => h.trim())
                    : [],
            };
            setBranches([...branches, newBranch]);
        } else if (modalType === "edit") {
            setBranches(
                branches.map((b) =>
                    b.id === formData.id
                        ? {
                            ...formData,
                            holidayList: formData.holidayList
                                ? formData.holidayList.split(",").map((h) => h.trim())
                                : [],
                        }
                        : b
                )
            );
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this branch?")) {
            setBranches(branches.filter((b) => b.id !== id));
        }
    };

    return (
        <div>
            <h2 className="mb-4 mt-4">Branch Settings </h2>

            {/* Add Button */}
            <div className="d-flex justify-content-end mb-3">
                <Button
                    style={{ backgroundColor: "#2f6a87", borderColor: "#2f6a87" }}
                    onClick={() => handleShowModal("add")}
                >
                    Add New Branch
                </Button>
            </div>


            {/* Table */}
            <Table bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>Branch Name</th>
                        <th>Opening Hours</th>
                        <th>Holiday List</th>
                        <th>Notification Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {branches.map((branch) => (
                        <tr key={branch.id}>
                            <td>{branch.branchName}</td>
                            <td>{branch.openingHours}</td>
                            <td>
                                {branch.holidayList && branch.holidayList.length > 0
                                    ? branch.holidayList.join(", ")
                                    : "No Holidays"}
                            </td>
                            <td>
                                {branch.notifications_enabled ? "Enabled" : "Disabled"}
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => handleShowModal("edit", branch)}
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDelete(branch.id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === "add" ? "Add Branch" : "Edit Branch"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Branch Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.branchName}
                                onChange={(e) =>
                                    setFormData({ ...formData, branchName: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Opening Hours</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Mon-Sun: 06:00-22:00"
                                value={formData.openingHours}
                                onChange={(e) =>
                                    setFormData({ ...formData, openingHours: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Holiday List (comma separated)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. 2025-01-01, 2025-08-15"
                                value={formData.holidayList}
                                onChange={(e) =>
                                    setFormData({ ...formData, holidayList: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="Enable Notifications"
                                checked={formData.notifications_enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notifications_enabled: e.target.checked,
                                    })
                                }
                            />
                            <Form.Check
                                type="checkbox"
                                label="Enable SMS Notifications"
                                checked={formData.sms_notifications_enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sms_notifications_enabled: e.target.checked,
                                    })
                                }
                            />
                            <Form.Check
                                type="checkbox"
                                label="Enable In-App Notifications"
                                checked={formData.in_app_notifications_enabled}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        in_app_notifications_enabled: e.target.checked,
                                    })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Notification Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.notification_message}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notification_message: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        style={{ backgroundColor: "#2f6a87", borderColor: "#2f6a87" }}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BranchManagement;   
