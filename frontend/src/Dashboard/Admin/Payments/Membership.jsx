import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';

const Membership = () => {
    const allMembers = [
        {
            id: 1,
            title: 'Gold Membership',
            name: 'Alex Johnson',
            amount: '500',
            paidAmount: '300',
            dueAmount: '200',
            startDate: 'January 1, 2020',
            endDate: 'December 26, 2020',
            paymentStatus: 'Pending'
        },
        {
            id: 2,
            title: 'Silver Membership',
            name: 'Braidy Con',
            amount: '300',
            paidAmount: '300',
            dueAmount: '0',
            startDate: 'February 1, 2020',
            endDate: 'January 31, 2021',
            paymentStatus: 'Completed'
        },
        {
            id: 3,
            title: 'Platinum Membership',
            name: 'John Doe',
            amount: '800',
            paidAmount: '500',
            dueAmount: '300',
            startDate: 'March 1, 2020',
            endDate: 'March 1, 2021',
            paymentStatus: 'Pending'
        },
        {
            id: 4,
            title: 'Basic Membership',
            name: 'Jane Smith',
            amount: '150',
            paidAmount: '150',
            dueAmount: '0',
            startDate: 'April 1, 2020',
            endDate: 'April 1, 2021',
            paymentStatus: 'Completed'
        },
        {
            id: 5,
            title: 'Gold Membership',
            name: 'Chris Lee',
            amount: '500',
            paidAmount: '250',
            dueAmount: '250',
            startDate: 'May 1, 2020',
            endDate: 'May 1, 2021',
            paymentStatus: 'Pending'
        },
        {
            id: 6,
            title: 'Silver Membership',
            name: 'Patricia Brown',
            amount: '300',
            paidAmount: '100',
            dueAmount: '200',
            startDate: 'June 1, 2020',
            endDate: 'June 1, 2021',
            paymentStatus: 'Pending'
        },
        {
            id: 7,
            title: 'Platinum Membership',
            name: 'Robert Wilson',
            amount: '800',
            paidAmount: '800',
            dueAmount: '0',
            startDate: 'July 1, 2020',
            endDate: 'July 1, 2021',
            paymentStatus: 'Completed'
        }
    ];

    const [members, setMembers] = useState(allMembers);
    const [filteredMembers, setFilteredMembers] = useState(allMembers);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewModal, setViewModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    useEffect(() => {
        setFilteredMembers(
            members.filter(member =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, members]);

    useEffect(() => {
        if (viewModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [viewModal]);

    const closeViewModal = () => {
        setViewModal(false);
        setSelectedMember(null);
    };

    const openViewModal = (member) => {
        setSelectedMember(member);
        setViewModal(true);
    };

    // Get current page members
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirst, indexOfLast);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-lg-8">
                    <h2 className="fw-bold">Payments List</h2>
                    <p className="text-muted mb-0">Manage all member payments and their status.</p>
                </div>
            </div>

            {/* Search */}
            <div className="row mb-4 g-3">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="input-group">
                        <span className="input-group-text bg-light border">
                            <i className="fas fa-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="fw-semibold">Title</th>
                                <th className="fw-semibold">Member Name</th>
                                <th className="fw-semibold">Amount</th>
                                <th className="fw-semibold">Paid Amount</th>
                                <th className="fw-semibold">Due Amount</th>
                                <th className="fw-semibold">Membership Start Date</th>
                                <th className="fw-semibold">Membership End Date</th>
                                <th className="fw-semibold">Payment Status</th>
                                <th className="fw-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMembers.map(member => (
                                <tr key={member.id}>
                                    <td>{member.title}</td>
                                    <td>{member.name}</td>
                                    <td>₹{member.amount}</td>
                                    <td>₹{member.paidAmount}</td>
                                    <td>₹{member.dueAmount}</td>
                                    <td>{member.startDate}</td>
                                    <td>{member.endDate}</td>
                                    <td>{member.paymentStatus}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            title="View"
                                            onClick={() => openViewModal(member)}
                                        >
                                            <FaEye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentMembers.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center text-muted py-4">
                                        No payments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center align-items-center mt-4">
                <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            {/* VIEW MODAL */}
            {viewModal && selectedMember && (
                <div
                    className="modal fade show"
                    tabIndex="-1"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeViewModal}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Payment Details</h5>
                                <button type="button" className="btn-close" onClick={closeViewModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p><strong>Title:</strong> {selectedMember.title}</p>
                                <p><strong>Member Name:</strong> {selectedMember.name}</p>
                                <p><strong> Amount:</strong> ₹{selectedMember.amount}</p>
                                <p><strong> Paid Amount:</strong> ₹{selectedMember.paidAmount}</p>
                                <p><strong> Due Amount:</strong> ₹{selectedMember.dueAmount}</p>
                                <p><strong>Membership Start Date:</strong> {selectedMember.startDate}</p>
                                <p><strong>Membership End Date:</strong> {selectedMember.endDate}</p>
                                <p><strong>Payment Status:</strong> {selectedMember.paymentStatus}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Membership;