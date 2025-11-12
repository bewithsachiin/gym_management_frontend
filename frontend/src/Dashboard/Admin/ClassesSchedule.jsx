import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../utils/axiosInstance";
import { useUser } from "../../UserContext";

const ClassesSchedule = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add', 'edit', 'view'
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/classes');
        
        // Handle different possible response structures
        let classesData = [];
        if (response.data && response.data.data && response.data.data.classes) {
          classesData = response.data.data.classes;
        } else if (response.data && Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data && Array.isArray(response.data.classes)) {
          classesData = response.data.classes;
        } else {
          console.warn('Unexpected API response structure for classes:', response.data);
          setError('Unexpected data format received from server');
          return;
        }
        
        // Ensure each class has the required fields
        const processedClasses = classesData.map(cls => ({
          ...cls,
          // Ensure trainer object exists
          trainer: cls.trainer || null,
          // Ensure schedule_day is an array
          schedule_day: Array.isArray(cls.schedule_day) 
            ? cls.schedule_day 
            : (cls.schedule_day ? cls.schedule_day.split(',') : [])
        }));
        
        setClasses(processedClasses);
      } catch (err) {
        setError('Failed to fetch classes');
        console.error('Error fetching classes:', err);
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClasses();
    }
  }, [user]);

  // Fetch trainers from API
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axiosInstance.get('/staff');
        
        // Handle different possible response structures
        let staffData = [];
        if (response.data && response.data.data && response.data.data.staff) {
          staffData = response.data.data.staff;
        } else if (response.data && Array.isArray(response.data)) {
          staffData = response.data;
        } else if (response.data && Array.isArray(response.data.staff)) {
          staffData = response.data.staff;
        } else {
          console.warn('Unexpected API response structure for staff:', response.data);
          setTrainers([]);
          return;
        }
        
        // Filter trainers based on role name containing "Trainer"
        const trainerStaff = staffData.filter(staff =>
          staff.role && staff.role.name.toLowerCase().includes('trainer')
        );

        const trainerOptions = trainerStaff.map(trainer => ({
          id: trainer.id,
          name: `${trainer.firstName} ${trainer.lastName}`,
          role: trainer.role.name
        }));

        setTrainers(trainerOptions);
      } catch (err) {
        console.error('Error fetching trainers:', err);
        setApiError(err.response?.data?.message || err.message);
        setTrainers([]); // Set empty array on error
      }
    };

    if (user) {
      fetchTrainers();
    }
  }, [user]);

  // Filter + Pagination
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes.filter(c =>
      c.class_name.toLowerCase().includes(q) ||
      c.trainer?.firstName?.toLowerCase().includes(q) ||
      c.trainer?.lastName?.toLowerCase().includes(q) ||
      (Array.isArray(c.schedule_day) 
        ? c.schedule_day.some(day => day.toLowerCase().includes(q))
        : c.schedule_day?.toLowerCase().includes(q))
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
  const handleAddNew = () => { 
    setModalType("add"); 
    setSelectedClass(null); 
    setSelectedDays([]); 
    setIsModalOpen(true); 
  };
  const handleView = (cls) => { 
    setModalType("view"); 
    setSelectedClass(cls); 
    setIsModalOpen(true); 
  };
  const handleEdit = (cls) => { 
    setModalType("edit"); 
    setSelectedClass(cls); 
    setIsModalOpen(true); 
  };
  const handleDeleteClick = (cls) => { 
    setSelectedClass(cls); 
    setIsDeleteModalOpen(true); 
  };

  const confirmDelete = async () => {
    if (selectedClass) {
      try {
        setApiError(null);
        await axiosInstance.delete(`/classes/${selectedClass.id}`);
        setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
        setIsDeleteModalOpen(false);
        setSelectedClass(null);
      } catch (err) {
        console.error('Error deleting class:', err);
        setApiError(err.response?.data?.message || err.message);
        alert('Failed to delete class');
      }
    }
  };
  const closeModal = () => { 
    setIsModalOpen(false); 
    setSelectedClass(null); 
    setApiError(null);
  };
  const closeDeleteModal = () => { 
    setIsDeleteModalOpen(false); 
    setSelectedClass(null); 
    setApiError(null);
  };

  // Helpers
  const getStatusBadge = (status) => (
    <span className={`badge rounded-pill ${status === "Active" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"} px-3 py-1`}>
      {status}
    </span>
  );
  const getModalTitle = () => modalType === "add" ? "Add New Class" : modalType === "edit" ? "Edit Class" : "View Class Details";
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}) : "—";
  const getNextClassId = () => `CLASS${String(Math.max(0,...classes.map(c=>+c.id))+1).padStart(3,"0")}`;

  // Handle form submission for add/edit
  const handleSubmit = async (formData) => {
    try {
      setApiError(null);
      
      const classData = {
        class_name: formData.class_name,
        trainer_id: parseInt(formData.trainer_id),
        date: formData.date,
        time: formData.time,
        schedule_day: selectedDays,
        total_sheets: parseInt(formData.total_sheets),
        status: formData.status
      };

      let response;
      if (modalType === 'add') {
        response = await axiosInstance.post('/classes', classData);
      } else if (modalType === 'edit') {
        response = await axiosInstance.put(`/classes/${selectedClass.id}`, classData);
      }

      // Handle different possible response structures
      let newClass = null;
      if (response.data && response.data.data && response.data.data.class) {
        newClass = response.data.data.class;
      } else if (response.data && response.data.class) {
        newClass = response.data.class;
      } else if (response.data) {
        newClass = response.data;
      } else {
        console.warn('Unexpected API response structure for class save:', response.data);
        setApiError('Unexpected data format received from server');
        return;
      }

      // Ensure the new class has the required fields
      const processedClass = {
        ...newClass,
        trainer: newClass.trainer || selectedClass?.trainer || null,
        schedule_day: Array.isArray(newClass.schedule_day) 
          ? newClass.schedule_day 
          : (newClass.schedule_day ? newClass.schedule_day.split(',') : [])
      };

      if (modalType === 'add') {
        setClasses(prev => [...prev, processedClass]);
      } else if (modalType === 'edit') {
        setClasses(prev => prev.map(c => c.id === selectedClass.id ? processedClass : c));
      }

      closeModal();
    } catch (err) {
      console.error('Error saving class:', err);
      const errorMessage = err.response?.data?.message || err.message;
      setApiError(errorMessage);
      alert(`Failed to save class: ${errorMessage}`);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* API Error Alert */}
      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {apiError}
          <button type="button" className="btn-close" onClick={() => setApiError(null)}></button>
        </div>
      )}

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
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4">Loading classes...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="text-center text-danger py-4">{error}</td></tr>
              ) : current.map(cls=>(
                <tr key={cls.id}>
                  <td>{cls.class_name}</td>
                  <td>{cls.trainer ? `${cls.trainer.firstName} ${cls.trainer.lastName}` : 'N/A'}</td>
                  <td>{formatDate(cls.date)}</td>
                  <td>{cls.time}</td>
                  <td>{Array.isArray(cls.schedule_day) ? cls.schedule_day.join(', ') : cls.schedule_day}</td>
                  <td>{cls.total_sheets}</td>
                  <td>{getStatusBadge(cls.status)}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>handleView(cls)}><FaEye size={14}/></button>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>handleEdit(cls)}><FaEdit size={14}/></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteClick(cls)}><FaTrashAlt size={14}/></button>
                  </td>
                </tr>
              ))}
              {!loading && !error && current.length===0 && <tr><td colSpan={8} className="text-center text-muted py-4">No classes found</td></tr>}
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
              <div className="modal-header border-0">
                <h5>{getModalTitle()}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {/* VIEW MODE: Display details in a clean, read-only format */}
                {modalType === "view" && selectedClass ? (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Class ID</label>
                      <p className="form-control-plaintext fw-semibold">{selectedClass.id}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Class Name</label>
                      <p className="form-control-plaintext">{selectedClass.class_name}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Trainer</label>
                      <p className="form-control-plaintext">
                        {selectedClass.trainer ? `${selectedClass.trainer.firstName} ${selectedClass.trainer.lastName}` : 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Schedule Days</label>
                      <p className="form-control-plaintext">
                        {Array.isArray(selectedClass.schedule_day) ? selectedClass.schedule_day.join(', ') : selectedClass.schedule_day}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Date</label>
                      <p className="form-control-plaintext">{formatDate(selectedClass.date)}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Time</label>
                      <p className="form-control-plaintext">{selectedClass.time}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Total Sheets</label>
                      <p className="form-control-plaintext">{selectedClass.total_sheets}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Status</label>
                      <div>{getStatusBadge(selectedClass.status)}</div>
                    </div>
                  </div>
                ) : (
                  /* ADD/EDIT MODE: Display the form */
                  <form id="classForm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Class ID</label>
                        <input className="form-control" defaultValue={selectedClass?.id||(modalType==="add"?getNextClassId():"")} readOnly/>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Class Name *</label>
                        <input name="class_name" className="form-control" defaultValue={selectedClass?.class_name||""} readOnly={modalType==="view"} required/>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Trainer *</label>
                        <select name="trainer_id" className="form-select" defaultValue={selectedClass?.trainer?.id || (trainers.length > 0 ? trainers[0].id : '')} disabled={modalType==="view"}>
                          <option value="">Select Trainer</option>
                          {trainers.map(t=><option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Schedule Days *</label>
                        <div className="d-flex flex-wrap gap-2">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" checked={selectedDays.length===days.length} onChange={handleSelectAll} disabled={modalType==="view"}/>
                            <label className="form-check-label">All</label>
                          </div>
                          {days.map(day=><div className="form-check" key={day}>
                            <input className="form-check-input" type="checkbox" checked={selectedDays.includes(day)} onChange={()=>handleDayChange(day)} disabled={modalType==="view"}/>
                            <label className="form-check-label">{day}</label>
                          </div>)}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Date *</label>
                        <input name="date" type="date" className="form-control" defaultValue={selectedClass?.date||new Date().toISOString().split("T")[0]} readOnly={modalType==="view"}/>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Time *</label>
                        <input name="time" className="form-control" defaultValue={selectedClass?.time||""} readOnly={modalType==="view"}/>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Total Sheets *</label>
                        <input name="total_sheets" type="number" className="form-control" defaultValue={selectedClass?.total_sheets||""} readOnly={modalType==="view"}/>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <select name="status" className="form-select" defaultValue={selectedClass?.status||"Active"} disabled={modalType==="view"}>
                          <option>Active</option><option>Inactive</option>
                        </select>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              {/* Modal Footer */}
              <div className="modal-footer border-0">
                {modalType === "view" ? (
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                ) : (
                  <>
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    <button type="button" style={{background:"#2F6A87",color:"#fff",borderRadius:"8px"}} className="btn btn-primary" onClick={async ()=>{
                      const form = document.querySelector('#classForm');
                      const formData = new FormData(form);
                      const data = Object.fromEntries(formData);

                      const trainerSelect = form.querySelector('select[name="trainer_id"]');
                      const selectedTrainerId = trainerSelect ? trainerSelect.value : '';

                      if (!selectedTrainerId) {
                        alert('Please select a trainer');
                        return;
                      }

                      data.trainer_id = selectedTrainerId;
                      data.schedule_day = selectedDays;

                      await handleSubmit(data);
                    }}>{modalType==="add"?"Add Class":"Update Class"}</button>
                  </>
                )}
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