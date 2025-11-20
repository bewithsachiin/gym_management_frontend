import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaPlus, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selected, setSelected] = useState(null);

  // Add Form
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState(null);
  const [preview, setPreview] = useState("");

  // Edit Form
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  /* ----------------------------------------------------------
     1. FETCH GROUPS (GET /groups)
  ---------------------------------------------------------- */
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/groups");

      if (res.data?.success) {
        setGroups(res.data.data.groups || []);
      } else {
        console.error("Invalid response format:", res.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  /* ----------------------------------------------------------
     2. IMAGE PREVIEW
  ---------------------------------------------------------- */
  const handleImageChange = (e, setPrev, setFile) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPrev(reader.result);
    reader.readAsDataURL(file);
  };

  /* ----------------------------------------------------------
     3. CREATE GROUP (POST /groups)
  ---------------------------------------------------------- */
  const saveGroup = async (e) => {
    e.preventDefault();

    if (!formName.trim()) return alert("Group Name is required");

    const fd = new FormData();
    fd.append("name", formName);
    if (formImage) fd.append("photo", formImage);

    try {
      const res = await axiosInstance.post("/groups", fd);
      if (!res.data.success) throw new Error(res.data.message);

      fetchGroups();
      setShowAdd(false);
    } catch (error) {
      console.error("Create error:", error);
      alert(error.response?.data?.message || "Failed to create group");
    }
  };

  /* ----------------------------------------------------------
     4. UPDATE GROUP (PUT /groups/:id)
  ---------------------------------------------------------- */
  const saveEdit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", editName);

    if (editImage) {
      fd.append("photo", editImage);
    }

    try {
      const res = await axiosInstance.put(`/groups/${selected.id}`, fd);
      if (!res.data.success) throw new Error(res.data.message);

      fetchGroups();
      setShowEdit(false);
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Failed to update group");
    }
  };

  /* ----------------------------------------------------------
     5. DELETE GROUP (DELETE /groups/:id)
  ---------------------------------------------------------- */
  const confirmDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/groups/${selected.id}`);

      if (!res.data.success) throw new Error(res.data.message);

      fetchGroups();
      setShowDelete(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete group");
    }
  };

  /* ----------------------------------------------------------
     SEARCH + SORT + PAGINATION
  ---------------------------------------------------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let data = groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        String(g.total).includes(q)
    );

    return data.sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }, [groups, search, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const current = useMemo(() => {
    let start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  /* ----------------------------------------------------------
     UI Helpers
  ---------------------------------------------------------- */
  const placeholder = (name) => (
    <div
      style={{
        width: 45,
        height: 45,
        background: "#e9ecef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        border: "1px solid #ccc",
        fontWeight: "bold",
      }}
    >
      {name?.charAt(0)}
    </div>
  );

  const openAdd = () => {
    setFormName("");
    setFormImage(null);
    setPreview("");
    setShowAdd(true);
  };

  const openEdit = (g) => {
    setSelected(g);
    setEditName(g.name);
    setEditPreview(g.photo || "");
    setEditImage(null);
    setShowEdit(true);
  };

  const openDelete = (g) => {
    setSelected(g);
    setShowDelete(true);
  };

  const openView = (g) => {
    setSelected(g);
    setShowView(true);
  };

  /* ----------------------------------------------------------
     JSX START
  ---------------------------------------------------------- */

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h4 className="fw-bold">Group List</h4>

        <button
          className="btn"
          onClick={openAdd}
          style={{
            backgroundColor: "#2F6A87",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 20px",
          }}
        >
          Add Group
        </button>
      </div>

      {/* SEARCH */}
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <span>Show</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 80 }}
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <input
          className="form-control"
          style={{ maxWidth: 250 }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="table-responsive border rounded">
        <table className="table align-middle">
          <thead className="table-light">
            <tr>
              <th>Photo</th>
              <th>Group Name</th>
              <th>Total Members</th>
              <th style={{ width: 160 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="text-center py-5" colSpan={4}>
                  <div className="spinner-border text-primary"></div>
                </td>
              </tr>
            ) : current.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No groups found
                </td>
              </tr>
            ) : (
              current.map((g) => (
                <tr key={g.id}>
                  <td>{g.photo ? <img src={g.photo} width={50} height={40} /> : placeholder(g.name)}</td>
                  <td>{g.name}</td>
                  <td>{g.total}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => openView(g)}
                    >
                      <FaEye size={14} />
                    </button>

                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => openEdit(g)}
                    >
                      <FaEdit size={14} />
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => openDelete(g)}
                    >
                      <FaTrashAlt size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between mt-3">
        <small>
          Showing {filtered.length ? (page - 1) * perPage + 1 : 0} to{" "}
          {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
        </small>

        <div className="btn-group">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${
                page === i + 1 ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* -------------------- MODALS -------------------- */}

      {/* ADD GROUP */}
      {showAdd && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>Add Group</h5>
                <button className="btn-close" onClick={() => setShowAdd(false)}></button>
              </div>

              <div className="modal-body">
                <form onSubmit={saveGroup}>
                  <label>Group Name</label>
                  <input
                    className="form-control mb-3"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />

                  <label>Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => handleImageChange(e, setPreview, setFormImage)}
                  />

                  {preview && <img src={preview} width={150} className="mt-2" alt="" />}

                  <button className="btn mt-3" style={{ background: "#2F6A87", color: "#fff" }}>
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW */}
      {showView && selected && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-3">
              <h5 className="fw-bold">View Group</h5>

              <p><strong>Name:</strong> {selected.name}</p>
              <p><strong>Total Members:</strong> {selected.total}</p>

              {selected.photo ? <img src={selected.photo} width={200} /> : placeholder(selected.name)}

              <button className="btn btn-secondary mt-3" onClick={() => setShowView(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT */}
      {showEdit && selected && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-3">
              <h5>Edit Group</h5>
              <form onSubmit={saveEdit}>
                <label>Group Name</label>
                <input
                  className="form-control mb-3"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <label>Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    handleImageChange(e, setEditPreview, setEditImage)
                  }
                />

                {editPreview && <img src={editPreview} width={150} className="mt-2" />}

                <div className="d-flex gap-2 mt-3">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEdit(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDelete && selected && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-3 text-center">
              <h5 className="fw-bold">Delete Group?</h5>
              <p>This will delete <strong>{selected.name}</strong>.</p>

              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setShowDelete(false)}>
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

export default Groups;
