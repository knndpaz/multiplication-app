import React, { useState, useEffect } from "react";
import Header from "./Header";
import people from "./assets/people.png";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore();

function randomPassword() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function Students({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [studentForm, setStudentForm] = useState({
    firstname: "",
    lastname: "",
    password: randomPassword(),
    profilePic: "",
  });
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      if (!user?.uid) return;
      setLoading(true);
      const snap = await getDocs(collection(db, "students", user.uid, "list"));
      const arr = [];
      snap.forEach((doc) => arr.push({ ...doc.data(), id: doc.id }));
      setStudents(arr);
      setLoading(false);
    }
    fetchStudents();
  }, [user]);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  function openAddModal() {
    setModalMode("add");
    setStudentForm({
      firstname: "",
      lastname: "",
      password: randomPassword(),
      profilePic: "",
    });
    setSelectedStudentId(null);
    setShowModal(true);
  }

  function openEditModal(student) {
    setModalMode("edit");
    setStudentForm({
      firstname: student.firstname,
      lastname: student.lastname,
      password: student.password,
      profilePic: student.profilePic || "",
    });
    setSelectedStudentId(student.id);
    setShowModal(true);
  }

  async function handleSaveStudent(e) {
    e.preventDefault();
    if (
      !studentForm.firstname ||
      !studentForm.lastname ||
      !studentForm.password
    )
      return;
    if (modalMode === "add") {
      await addDoc(collection(db, "students", user.uid, "list"), {
        ...studentForm,
        createdAt: new Date().toISOString(),
      });
    } else if (modalMode === "edit" && selectedStudentId) {
      await updateDoc(
        doc(db, "students", user.uid, "list", selectedStudentId),
        { ...studentForm, updatedAt: new Date().toISOString() }
      );
    }
    setShowModal(false);
    const snap = await getDocs(collection(db, "students", user.uid, "list"));
    const arr = [];
    snap.forEach((doc) => arr.push({ ...doc.data(), id: doc.id }));
    setStudents(arr);
  }

  async function handleDeleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    await deleteDoc(doc(db, "students", user.uid, "list", id));
    setStudents(students.filter((s) => s.id !== id));
  }

  function handleProfilePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      setStudentForm((form) => ({
        ...form,
        profilePic: ev.target.result,
      }));
    };
    reader.readAsDataURL(file);
  }

  const clearSearch = () => {
    setSearchQuery("");
  };

  const studentsPerPage = 10;
  const filteredStudents = students.filter((s) =>
    `${s.firstname} ${s.lastname} ${s.id}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="students-bg">
        <Header user={user} onLogout={onLogout} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="students-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="students-content">
        <div className="students-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{">"}</span>
          <span style={{ color: "#888" }}>Students</span>
        </div>

        <div className="students-title-row card">
          <div className="students-title-left">
            <div className="students-icon-wrapper">
              <span className="material-icons students-title-icon">groups</span>
            </div>
            <div>
              <div className="students-title">Student Management</div>
              <div className="students-subtitle">
                Add, edit, and manage student accounts
              </div>
            </div>
          </div>
          <div className="students-title-right">
            <div className="students-search">
              <span className="material-icons search-icon">search</span>
              <input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <span
                  className="material-icons clear-icon"
                  onClick={clearSearch}
                >
                  close
                </span>
              )}
            </div>
            <button className="students-add-btn" onClick={openAddModal}>
              <span className="material-icons">person_add</span>
              Add Student
            </button>
          </div>
        </div>

        <div className="students-stats-row">
          <div className="students-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #B794F6, #9D7CE8)",
              }}
            >
              <span className="material-icons">groups</span>
            </div>
            <div className="stat-content">
              <div className="students-stat-label">Total Students</div>
              <div className="students-stat-value">{students.length}</div>
            </div>
          </div>

          <div className="students-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #4CAF50, #45a049)",
              }}
            >
              <span className="material-icons">person_add</span>
            </div>
            <div className="stat-content">
              <div className="students-stat-label">Active Accounts</div>
              <div className="students-stat-value" style={{ color: "#4CAF50" }}>
                {students.length}
              </div>
            </div>
          </div>

          <div className="students-stat card">
            <div
              className="stat-icon-wrapper"
              style={{
                background: "linear-gradient(135deg, #2196F3, #1976D2)",
              }}
            >
              <span className="material-icons">search</span>
            </div>
            <div className="stat-content">
              <div className="students-stat-label">Search Results</div>
              <div className="students-stat-value" style={{ color: "#2196F3" }}>
                {filteredStudents.length}
              </div>
            </div>
          </div>
        </div>

        <div className="students-main-row">
          <div className="students-main-col card">
            <div className="students-section-header">
              <div className="students-section-title">
                <span className="material-icons" style={{ marginRight: 8 }}>
                  people
                </span>
                Student Directory
              </div>
              {searchQuery && (
                <div className="search-results-info">
                  Found {filteredStudents.length} student
                  {filteredStudents.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="students-table-container">
              <div className="students-table-header">
                <span>Student</span>
                <span>Password</span>
                <span>ID</span>
                <span className="actions-header">Actions</span>
              </div>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <div className="students-table-row" key={student.id}>
                    <div className="students-info">
                      <img
                        src={student.profilePic || people}
                        alt="Profile"
                        className="students-img"
                      />
                      <div>
                        <div className="students-name">
                          {student.firstname} {student.lastname}
                        </div>
                        <div className="students-meta">
                          ID: {student.id?.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div className="students-password">
                      <span className="password-badge">{student.password}</span>
                    </div>
                    <div className="students-id">{student.id?.slice(-8)}</div>
                    <div className="students-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditModal(student)}
                        title="Edit student"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Delete student"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <span className="material-icons">search_off</span>
                  <p>No students found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="students-pagination">
                <button
                  className="page-nav"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-icons">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <span
                          key={page}
                          className={`students-page ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </span>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="page-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}

                <button
                  className="page-nav"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add" ? "Add New Student" : "Edit Student"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveStudent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="modal-label">
                    <span className="material-icons">image</span>
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="file-input"
                  />
                  {studentForm.profilePic && (
                    <div className="preview-container">
                      <img
                        src={studentForm.profilePic}
                        alt="Preview"
                        className="profile-preview"
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="modal-label">
                      <span className="material-icons">person</span>
                      First Name
                    </label>
                    <input
                      className="modal-input"
                      type="text"
                      required
                      placeholder="Enter first name"
                      value={studentForm.firstname}
                      onChange={(e) =>
                        setStudentForm((f) => ({
                          ...f,
                          firstname: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="modal-label">
                      <span className="material-icons">person_outline</span>
                      Last Name
                    </label>
                    <input
                      className="modal-input"
                      type="text"
                      required
                      placeholder="Enter last name"
                      value={studentForm.lastname}
                      onChange={(e) =>
                        setStudentForm((f) => ({
                          ...f,
                          lastname: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="modal-label">
                    <span className="material-icons">lock</span>
                    Password
                  </label>
                  <div className="password-input-group">
                    <input
                      className="modal-input"
                      type="text"
                      value={studentForm.password}
                      readOnly
                    />
                    <button
                      type="button"
                      className="generate-btn"
                      onClick={() =>
                        setStudentForm((f) => ({
                          ...f,
                          password: randomPassword(),
                        }))
                      }
                    >
                      <span className="material-icons">refresh</span>
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn save-btn">
                  <span className="material-icons">
                    {modalMode === "add" ? "add" : "save"}
                  </span>
                  {modalMode === "add" ? "Add Student" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .students-bg {
          min-height: 100vh;
          background: linear-gradient(180deg, #F864D3 0%, #9D7CE8 50%, #6BAAFF 100%);
          padding: 0;
          font-family: 'Poppins', sans-serif;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60vh;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          color: white;
          font-size: 18px;
          font-weight: 600;
        }
        
        .students-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .students-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #555;
          font-weight: 500;
          padding: 14px 20px;
        }
        
        .students-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .students-title-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .students-icon-wrapper {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #B794F6, #9D7CE8);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(157, 124, 232, 0.3);
        }
        
        .students-title-icon {
          font-size: 32px;
          color: white;
        }
        
        .students-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        
        .students-subtitle {
          font-size: 0.9rem;
          color: #666;
          font-weight: 400;
        }
        
        .students-title-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .students-search {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          min-width: 300px;
          transition: all 0.3s ease;
        }
        
        .students-search:focus-within {
          border-color: #9D7CE8;
          box-shadow: 0 0 0 4px rgba(157, 124, 232, 0.1);
        }
        
        .search-icon {
          color: #9D7CE8;
          font-size: 22px;
          margin-right: 8px;
        }
        
        .students-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          flex: 1;
          font-family: 'Poppins', sans-serif;
        }
        
        .students-search input::placeholder {
          color: #9CA3AF;
        }
        
        .clear-icon {
          color: #999;
          font-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .clear-icon:hover {
          color: #666;
        }
        
        .students-add-btn {
          background: linear-gradient(135deg, #9D7CE8, #B794F6);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(157, 124, 232, 0.3);
        }
        
        .students-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(157, 124, 232, 0.4);
        }
        
        .students-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .students-stat {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          transition: transform 0.2s;
        }
        
        .students-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stat-icon-wrapper .material-icons {
          font-size: 28px;
          color: white;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .students-stat-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .students-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          line-height: 1;
        }
        
        .students-main-row {
          display: flex;
          gap: 24px;
        }
        
        .students-main-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .students-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .students-section-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .search-results-info {
          background: linear-gradient(135deg, #9D7CE8, #B794F6);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        
        .students-table-container {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 8px 0;
          margin-bottom: 20px;
          min-height: 400px;
        }
        
        .students-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 140px;
          gap: 16px;
          font-size: 13px;
          color: #666;
          font-weight: 600;
          padding: 14px 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .students-table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 140px;
          gap: 16px;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #E5E7EB;
          transition: all 0.2s;
        }
        
        .students-table-row:last-child {
          border-bottom: none;
        }
        
        .students-table-row:hover {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .students-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .students-img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .students-name {
          font-weight: 600;
          color: #333;
          font-size: 15px;
          margin-bottom: 4px;
        }
        
        .students-meta {
          font-size: 12px;
          color: #666;
        }
        
        .students-password {
          font-size: 14px;
          color: #666;
        }
        
        .password-badge {
          background: linear-gradient(135deg, #E0E7FF, #C7D2FE);
          color: #4338CA;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }
        
        .students-id {
          font-size: 13px;
          color: #666;
          font-family: 'Courier New', monospace;
        }
        
        .students-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .edit-btn {
          background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
          color: #1E40AF;
        }
        
        .edit-btn:hover {
          background: linear-gradient(135deg, #BFDBFE, #93C5FD);
          transform: translateY(-2px);
        }
        
        .delete-btn {
          background: linear-gradient(135deg, #FEE2E2, #FECACA);
          color: #991B1B;
        }
        
        .delete-btn:hover {
          background: linear-gradient(135deg, #FECACA, #FCA5A5);
          transform: translateY(-2px);
        }
        
        .action-btn .material-icons {
          font-size: 18px;
        }
        
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #999;
        }
        
        .no-results .material-icons {
          font-size: 64px;
          color: #ccc;
          margin-bottom: 16px;
        }
        
        .no-results p {
          font-size: 16px;
          font-weight: 500;
        }
        
        .students-pagination {
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
          padding: 16px 0;
        }
        
        .page-nav {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: white;
          border: 2px solid #E5E7EB;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .page-nav:hover:not(:disabled) {
          background: #F3F4F6;
          border-color: #9D7CE8;
        }
        
        .page-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .students-page {
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          border-radius: 8px;
          background: white;
          border: 2px solid #E5E7EB;
          color: #666;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .students-page:hover {
          border-color: #9D7CE8;
          background: #F3F4F6;
        }
        
        .students-page.active {
          background: linear-gradient(135deg, #9D7CE8, #B794F6);
          color: white;
          border-color: #9D7CE8;
        }
        
        .page-ellipsis {
          padding: 0 8px;
          color: #999;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px 24px;
          border-bottom: 2px solid #F3F4F6;
        }
        
        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }
        
        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #F3F4F6;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .modal-close:hover {
          background: #E5E7EB;
        }
        
        .modal-close .material-icons {
          font-size: 20px;
          color: #666;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .modal-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .modal-label .material-icons {
          font-size: 18px;
          color: #9D7CE8;
        }
        
        .modal-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'Poppins', sans-serif;
          transition: all 0.2s;
          outline: none;
        }
        
        .modal-input:focus {
          border-color: #9D7CE8;
          box-shadow: 0 0 0 4px rgba(157, 124, 232, 0.1);
        }
        
        .modal-input::placeholder {
          color: #9CA3AF;
        }
        
        .file-input {
          width: 100%;
          padding: 10px;
          border: 2px dashed #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .file-input:hover {
          border-color: #9D7CE8;
          background: #F9FAFB;
        }
        
        .preview-container {
          margin-top: 12px;
          display: flex;
          justify-content: center;
        }
        
        .profile-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #E5E7EB;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .password-input-group {
          display: flex;
          gap: 10px;
        }
        
        .password-input-group .modal-input {
          flex: 1;
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }
        
        .generate-btn {
          background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
          color: #374151;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .generate-btn:hover {
          background: linear-gradient(135deg, #E5E7EB, #D1D5DB);
        }
        
        .generate-btn .material-icons {
          font-size: 18px;
        }
        
        .modal-footer {
          padding: 16px 24px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          border-top: 2px solid #F3F4F6;
        }
        
        .modal-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          border: none;
        }
        
        .cancel-btn {
          background: #F3F4F6;
          color: #6B7280;
        }
        
        .cancel-btn:hover {
          background: #E5E7EB;
        }
        
        .save-btn {
          background: linear-gradient(135deg, #9D7CE8, #B794F6);
          color: white;
          box-shadow: 0 4px 15px rgba(157, 124, 232, 0.3);
        }
        
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(157, 124, 232, 0.4);
        }
        
        .modal-btn .material-icons {
          font-size: 18px;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .students-stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .students-content {
            padding: 16px;
          }
          
          .card {
            padding: 16px;
          }
          
          .students-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .students-title-left {
            width: 100%;
          }
          
          .students-title-right {
            width: 100%;
            flex-direction: column;
          }
          
          .students-search {
            width: 100%;
            min-width: 0;
          }
          
          .students-add-btn {
            width: 100%;
            justify-content: center;
          }
          
          .students-stats-row {
            grid-template-columns: 1fr;
          }
          
          .students-icon-wrapper {
            width: 50px;
            height: 50px;
          }
          
          .students-title-icon {
            font-size: 26px;
          }
          
          .students-title {
            font-size: 1.2rem;
          }
          
          .students-subtitle {
            font-size: 0.85rem;
          }
          
          .students-stat {
            padding: 16px;
          }
          
          .stat-icon-wrapper {
            width: 48px;
            height: 48px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 24px;
          }
          
          .students-stat-value {
            font-size: 1.6rem;
          }
          
          .students-table-header,
          .students-table-row {
            grid-template-columns: 1.5fr 1fr 120px;
            padding: 12px 16px;
            gap: 12px;
          }
          
          .students-password,
          .actions-header {
            display: none;
          }
          
          .students-img {
            width: 36px;
            height: 36px;
          }
          
          .students-name {
            font-size: 14px;
          }
          
          .students-meta {
            font-size: 11px;
          }
          
          .students-id {
            font-size: 12px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .modal {
            max-width: 90%;
          }
        }
        
        @media (max-width: 480px) {
          .students-content {
            padding: 12px;
          }
          
          .card {
            padding: 12px;
            border-radius: 16px;
          }
          
          .students-breadcrumb {
            font-size: 11px;
            padding: 10px 14px;
            overflow-x: auto;
            white-space: nowrap;
          }
          
          .students-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .students-title-icon {
            font-size: 22px;
          }
          
          .students-title {
            font-size: 1.1rem;
          }
          
          .students-subtitle {
            font-size: 0.8rem;
          }
          
          .students-search {
            padding: 8px 12px;
          }
          
          .search-icon {
            font-size: 20px;
          }
          
          .students-search input {
            font-size: 14px;
          }
          
          .students-stat {
            padding: 14px;
          }
          
          .stat-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .stat-icon-wrapper .material-icons {
            font-size: 22px;
          }
          
          .students-stat-label {
            font-size: 11px;
          }
          
          .students-stat-value {
            font-size: 1.4rem;
          }
          
          .students-section-title {
            font-size: 1rem;
          }
          
          .students-table-header {
            font-size: 11px;
            padding: 10px 12px;
          }
          
          .students-table-row {
            padding: 10px 12px;
            grid-template-columns: 1.8fr 1fr 100px;
            gap: 8px;
          }
          
          .students-info {
            gap: 10px;
          }
          
          .students-img {
            width: 32px;
            height: 32px;
            border-width: 2px;
          }
          
          .students-name {
            font-size: 13px;
          }
          
          .students-meta {
            font-size: 10px;
          }
          
          .students-id {
            font-size: 11px;
          }
          
          .students-actions {
            gap: 4px;
          }
          
          .action-btn {
            width: 32px;
            height: 32px;
          }
          
          .action-btn .material-icons {
            font-size: 16px;
          }
          
          .students-pagination {
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .page-nav {
            width: 32px;
            height: 32px;
          }
          
          .page-nav .material-icons {
            font-size: 20px;
          }
          
          .students-page {
            min-width: 32px;
            height: 32px;
            font-size: 13px;
          }
          
          .no-results .material-icons {
            font-size: 48px;
          }
          
          .no-results p {
            font-size: 14px;
          }
          
          .search-results-info {
            font-size: 12px;
            padding: 5px 12px;
          }
          
          .modal {
            max-width: 95%;
            border-radius: 16px;
          }
          
          .modal-header {
            padding: 16px;
          }
          
          .modal-header h2 {
            font-size: 1.2rem;
          }
          
          .modal-body {
            padding: 16px;
          }
          
          .modal-footer {
            padding: 12px 16px 16px 16px;
            flex-direction: column;
          }
          
          .modal-btn {
            width: 100%;
            justify-content: center;
          }
          
          .password-input-group {
            flex-direction: column;
          }
          
          .generate-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Students;
