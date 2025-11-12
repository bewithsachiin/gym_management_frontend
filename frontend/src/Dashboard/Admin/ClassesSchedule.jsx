import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const ClassesSchedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add', 'edit', 'view'
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const trainers = [
    { id: 1, name: "John Smith" },
    { id: 2, name: "Mike Williams" },
    { id: 3, name: "Sarah Johnson" },
    { id: 4, name: "Robert Davis" },
  ];

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const [classes, setClasses] = useState([
    { id: 101, class_name: "Strength Training", trainer_name: "John Smith", date: "2023-06-20", time: "10:00 - 11:00", schedule_day: "Tuesday", total_sheets: 15, status: "Active" },
     { id: 101, class_name: "Strength Training", trainer_name: "John Smith", date: "2023-06-20", time: "10:00 - 11:00", schedule_day: "Tuesday", total_sheets: 15, status: "Active" },
      { id: 101, class_name: "Strength Training", trainer_name: "John Smith", date: "2023-06-20", time: "10:00 - 11:00", schedule_day: "Tuesday", total_sheets: 15, status: "Active" },
    { id: 102, class_name: "Cardio & HIIT", trainer_name: "Mike Williams", date: "2023-06-22", time: "14:00 - 15:00", schedule_day: "Thursday", total_sheets: 20, status: "Active" },
    { id: 103, class_name: "Yoga Basics", trainer_name: "Sarah Johnson", date: "2023-06-24", time: "09:00 - 10:00", schedule_day: "Saturday", total_sheets: 12, status: "Active" },
    { id: 104, class_name: "Advanced Pilates", trainer_name: "Robert Davis", date: "2023-06-26", time: "18:00 - 19:00", schedule_day: "Monday", total_sheets: 10, status: "Inactive" }
  ]);

  // Filter + Pagination
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes.filter(c =>
      c.class_name.toLowerCase().includes(q) ||
      c.trainer_name.toLowerCase().includes(q) ||
      c.schedule_day.toLowerCase().includes(q)
    );
  }, [search, classes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => { setPage(1); }, [search, perPage]);

  // Sync days when opening modal
  useEffect(() => {
    if (selectedClass?.schedule_day) {
      setSelectedDays(
        Array.isArray(selectedClass.schedule_day)
          ? selectedClass.schedule_day
          : selectedClass.schedule_day.split(",")
      );
    } else {
      setSelectedDays([]);
    }
  }, [selectedClass, modalType]);

  // Checkbox handlers
  const handleDayChange = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  const handleSelectAll = () => {
    setSelectedDays(selectedDays.length === days.length ? [] : days);
  };

  // Actions
  const handleAddNew = () => { setModalType("add"); setSelectedClass(null); setIsModalOpen(true); };
  const handleView = (cls) => { setModalType("view"); setSelectedClass(cls); setIsModalOpen(true); };
  const handleEdit = (cls) => { setModalType("edit"); setSelectedClass(cls); setIsModalOpen(true); };
  const handleDeleteClick = (cls) => { setSelectedClass(cls); setIsDeleteModalOpen(true); };
  const confirmDelete = () => {
    if (selectedClass) setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
    setIsDeleteModalOpen(false); setSelectedClass(null);
  };
  const closeModal = () => { setIsModalOpen(false); setSelectedClass(null); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedClass(null); };

  // Helpers
  const getStatusBadge = (status) => (
    <span className={`badge rounded-pill ${status === "Active" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"} px-3 py-1`}>
      {status}
    </span>
  );
  const getModalTitle = () => modalType === "add" ? "Add New Class" : modalType === "edit" ? "Edit Class" : "View Class Details";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}) : "—";
  const getNextClassId = () => `CLASS${String(Math.max(0,...classes.map(c=>+c.id))+1).padStart(3,"0")}`;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">All Class Scheduled</h4>
        <button className="btn" style={{background:"#2F6A87",color:"#fff",borderRadius:"8px"}} onClick={handleAddNew}>
          <i className="fas fa-plus me-2"></i>Add Class
        </button>
      </div>

      {/* Toolbar */}
      <div className="d-flex flex-wrap justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span>Show</span>
          <select className="form-select form-select-sm" style={{width:80}} value={perPage} onChange={e=>setPerPage(+e.target.value)}>
            {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
          <span>Entries</span>
        </div>
        <div className="input-group" style={{maxWidth:280}}>
          <span className="input-group-text bg-white border"><i className="bi bi-search text-muted"/></span>
          <input className="form-control" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light"><tr>
              <th>Class Name</th><th>Trainer</th><th>Date</th><th>Time</th><th>Day</th><th>Sheets</th><th>Status</th><th className="text-center">Actions</th>
            </tr></thead>
            <tbody>
              {current.map(cls=>(
                <tr key={cls.id}>
                  <td>{cls.class_name}</td>
                  <td>{cls.trainer_name}</td>
                  <td>{formatDate(cls.date)}</td>
                  <td>{cls.time}</td>
                  <td>{cls.schedule_day}</td>
                  <td>{cls.total_sheets}</td>
                  <td>{getStatusBadge(cls.status)}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>handleView(cls)}><FaEye size={14}/></button>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>handleEdit(cls)}><FaEdit size={14}/></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteClick(cls)}><FaTrashAlt size={14}/></button>
                  </td>
                </tr>
              ))}
              {current.length===0 && <tr><td colSpan={8} className="text-center text-muted py-4">No classes found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between mt-4">
        <small>Showing {filtered.length?(page-1)*perPage+1:0} to {Math.min(page*perPage,filtered.length)} of {filtered.length} entries</small>
        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button>
          {Array.from({length:totalPages},(_,i)=>
            <button key={i+1} className={`btn btn-sm ${page===i+1?"btn-primary":"btn-outline-secondary"}`} onClick={()=>setPage(i+1)}>{i+1}</button>
          )}
          <button className="btn btn-outline-secondary btn-sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>

      {/* Add/Edit/View Modal */}
      {isModalOpen && (
        <div className="modal fade show" style={{display:"block",background:"rgba(0,0,0,.5)"}} onClick={closeModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0"><h5>{getModalTitle()}</h5><button className="btn-close" onClick={closeModal}></button></div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label">Class ID</label>
                      <input className="form-control" defaultValue={selectedClass?.id||(modalType==="add"?getNextClassId():"")} readOnly/></div>
                    <div className="col-md-6"><label className="form-label">Class Name *</label>
                      <input className="form-control" defaultValue={selectedClass?.class_name||""} readOnly={modalType==="view"} required/></div>
                    <div className="col-md-6"><label className="form-label">Trainer *</label>
                      <select className="form-select" defaultValue={selectedClass?.trainer_name||trainers[0].name} disabled={modalType==="view"}>
                        {trainers.map(t=><option key={t.id}>{t.name}</option>)}
                      </select></div>
                    <div className="col-md-6"><label className="form-label">Schedule Days *</label>
                      <div className="d-flex flex-wrap gap-2">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" checked={selectedDays.length===days.length} onChange={handleSelectAll} disabled={modalType==="view"}/>
                          <label className="form-check-label">All</label>
                        </div>
                        {days.map(day=><div className="form-check" key={day}>
                          <input className="form-check-input" type="checkbox" checked={selectedDays.includes(day)} onChange={()=>handleDayChange(day)} disabled={modalType==="view"}/>
                          <label className="form-check-label">{day}</label>
                        </div>)}
                      </div></div>
                    <div className="col-md-6"><label className="form-label">Date *</label>
                      <input type="date" className="form-control" defaultValue={selectedClass?.date||new Date().toISOString().split("T")[0]} readOnly={modalType==="view"}/></div>
                    <div className="col-md-6"><label className="form-label">Time *</label>
                      <input className="form-control" defaultValue={selectedClass?.time||""} readOnly={modalType==="view"}/></div>
                    <div className="col-md-6"><label className="form-label">Total Sheets *</label>
                      <input type="number" className="form-control" defaultValue={selectedClass?.total_sheets||""} readOnly={modalType==="view"}/></div>
                    <div className="col-md-6"><label className="form-label">Status</label>
                      <select className="form-select" defaultValue={selectedClass?.status||"Active"} disabled={modalType==="view"}>
                        <option>Active</option><option>Inactive</option>
                      </select></div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    {modalType!=="view" && <button type="button" style={{background:"#2F6A87",color:"#fff",borderRadius:"8px"}} className="btn btn-primary" onClick={()=>{
                      alert(`${modalType==="add"?"New":"Updated"} class with days: ${selectedDays.join(",")}`);
                      closeModal();
                    }}>{modalType==="add"?"Add Class":"Update Class"}</button>}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>)}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="modal fade show" style={{display:"block",background:"rgba(0,0,0,.5)"}} onClick={closeDeleteModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0"><h5>Confirm Deletion</h5><button className="btn-close" onClick={closeDeleteModal}></button></div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3"><i className="fas fa-exclamation-triangle"/></div>
                <p>Delete <strong>{selectedClass?.class_name}</strong>?</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-outline-secondary" onClick={closeDeleteModal}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>)}
    </div>
  );
};

export default ClassesSchedule;
