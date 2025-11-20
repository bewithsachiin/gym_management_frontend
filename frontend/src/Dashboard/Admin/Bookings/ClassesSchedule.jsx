import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axiosInstance"
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ClassesSchedule = () => {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add");

  // Form State
  const [selectedClass, setSelectedClass] = useState(null);
  const [formClassName, setFormClassName] = useState("");
  const [formTrainerId, setFormTrainerId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formSheets, setFormSheets] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formDays, setFormDays] = useState([]);

  /* ------------------------------------------------------------------
      FETCH CLASS LIST
  ------------------------------------------------------------------ */
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/classes");
      setClasses(res.data.data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      alert("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
      FETCH TRAINERS (correct response: res.data.data.trainers)
  ------------------------------------------------------------------ */
  const fetchTrainers = async () => {
    try {
      const res = await axiosInstance.get("/classes/trainers");
      setTrainers(res.data.data.trainers || []);
    } catch (err) {
      console.error("Error loading trainers:", err);
      alert("Failed to load trainers");
    }
  };

  /* Initial Fetch */
  useEffect(() => {
    fetchTrainers();
    fetchClasses();
  }, []);

  /* ------------------------------------------------------------------
      OPEN MODALS
  ------------------------------------------------------------------ */
  const handleAddNew = () => {
    setModalType("add");
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (cls) => {
    setModalType("edit");
    fillForm(cls);
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleView = (cls) => {
    setModalType("view");
    fillForm(cls);
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cls) => {
    setSelectedClass(cls);
    setIsDeleteModalOpen(true);
  };

  /* ------------------------------------------------------------------
      RESET FORM
  ------------------------------------------------------------------ */
  const resetForm = () => {
    setFormClassName("");
    setFormTrainerId("");
    setFormDate("");
    setFormTime("");
    setFormSheets("");
    setFormStatus("Active");
    setFormDays([]);
  };

  const fillForm = (cls) => {
    setFormClassName(cls.class_name);
    setFormTrainerId(cls.trainer_id);
    setFormDate(cls.date?.split("T")[0]);
    setFormTime(cls.time);
    setFormSheets(cls.total_sheets);
    setFormStatus(cls.status);
    setFormDays(Array.isArray(cls.schedule_day) ? cls.schedule_day : []);
  };

  /* ------------------------------------------------------------------
      CREATE CLASS
  ------------------------------------------------------------------ */
  const saveNewClass = async () => {
    try {
      await axiosInstance.post("/classes", {
        class_name: formClassName,
        trainer_id: formTrainerId,
        date: formDate,
        time: formTime,
        schedule_day: formDays,
        total_sheets: formSheets,
        status: formStatus,
      });

      fetchClasses();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Create error:", err);
      alert(err.response?.data?.message || "Failed to create class");
    }
  };

  /* ------------------------------------------------------------------
      UPDATE CLASS
  ------------------------------------------------------------------ */
  const updateExistingClass = async () => {
    try {
      await axiosInstance.put(`/classes/${selectedClass.id}`, {
        class_name: formClassName,
        trainer_id: formTrainerId,
        date: formDate,
        time: formTime,
        schedule_day: formDays,
        total_sheets: formSheets,
        status: formStatus,
      });

      fetchClasses();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Failed to update class");
    }
  };

  /* ------------------------------------------------------------------
      DELETE CLASS
  ------------------------------------------------------------------ */
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/classes/${selectedClass.id}`);
      fetchClasses();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete class");
    }
  };

  /* ------------------------------------------------------------------
      MULTI-CHECKBOX DAYS
  ------------------------------------------------------------------ */
  const toggleDay = (day) => {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  /* ------------------------------------------------------------------
      DATE FORMAT
  ------------------------------------------------------------------ */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h2 className="fw-bold">Class Schedule</h2>

        <button
          className="btn"
          style={{
            backgroundColor: "#6EB2CC",
            color: "white",
            borderRadius: "8px",
            padding: "10px 20px",
          }}
          onClick={handleAddNew}
        >
          + Add Class
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light fw-semibold">
              <tr>
                <th>Class Name</th>
                <th>Trainer</th>
                <th>Date</th>
                <th>Time</th>
                <th>Days</th>
                <th>Sheets</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border text-primary" />
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>
                      <strong>{cls.class_name}</strong>
                    </td>

                    <td>
                      {cls.trainer?.firstName} {cls.trainer?.lastName}
                    </td>

                    <td>{formatDate(cls.date)}</td>

                    <td>{cls.time}</td>

                    <td>{cls.schedule_day?.join(", ")}</td>

                    <td>{cls.total_sheets}</td>

                    <td>
                      <span
                        className={`badge rounded-pill px-3 ${
                          cls.status === "Active"
                            ? "bg-success-subtle text-success-emphasis"
                            : "bg-danger-subtle text-danger-emphasis"
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleView(cls)}
                        >
                          <FaEye size={14} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(cls)}
                        >
                          <FaEdit size={14} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(cls)}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===========================================================
          ADD / EDIT / VIEW MODAL
      =========================================================== */}
      {isModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,.5)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content p-4">
              <h5 className="fw-bold mb-3">
                {modalType === "add"
                  ? "Add New Class"
                  : modalType === "edit"
                  ? "Edit Class"
                  : "View Class Details"}
              </h5>

              {/* CLASS NAME */}
              <label>Class Name</label>
              <input
                className="form-control mb-3"
                disabled={modalType === "view"}
                value={formClassName}
                onChange={(e) => setFormClassName(e.target.value)}
              />

              {/* TRAINER */}
              <label>Trainer</label>
              <select
                className="form-select mb-3"
                disabled={modalType === "view"}
                value={formTrainerId}
                onChange={(e) => setFormTrainerId(e.target.value)}
              >
                <option value="">Select Trainer</option>

                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>

              {/* MULTI CHECKBOX DAYS */}
              <label>Schedule Days</label>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {DAYS.map((d) => (
                  <div className="form-check" key={d}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      disabled={modalType === "view"}
                      checked={formDays.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                    <label className="form-check-label">{d}</label>
                  </div>
                ))}
              </div>

              {/* DATE */}
              <label>Date</label>
              <input
                type="date"
                className="form-control mb-3"
                disabled={modalType === "view"}
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />

              {/* TIME */}
              <label>Time</label>
              <input
                className="form-control mb-3"
                disabled={modalType === "view"}
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
              />

              {/* SHEETS */}
              <label>Total Sheets</label>
              <input
                type="number"
                className="form-control mb-3"
                value={formSheets}
                disabled={modalType === "view"}
                onChange={(e) => setFormSheets(e.target.value)}
              />

              {/* STATUS */}
              <label>Status</label>
              <select
                className="form-select mb-3"
                disabled={modalType === "view"}
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>

              {/* BUTTONS */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>

                {modalType !== "view" && (
                  <button
                    className="btn"
                    style={{ background: "#6EB2CC", color: "#fff" }}
                    onClick={modalType === "add" ? saveNewClass : updateExistingClass}
                  >
                    {modalType === "add" ? "Add Class" : "Update Class"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================================
           DELETE MODAL
      =========================================================== */}
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,.5)" }}
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content text-center p-4">
              <h5 className="fw-bold">Delete Class?</h5>

              <p className="text-muted">
                This will permanently delete:
                <br />
                <strong>{selectedClass?.class_name}</strong>
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={confirmDelete}>
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

export default ClassesSchedule;
