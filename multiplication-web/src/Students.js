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

  useEffect(() => {
    async function fetchStudents() {
      if (!user?.uid) return;
      const snap = await getDocs(collection(db, "students", user.uid, "list"));
      const arr = [];
      snap.forEach((doc) => arr.push({ ...doc.data(), id: doc.id }));
      setStudents(arr);
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

  const studentsPerPage = 10;
  const filteredStudents = students.filter((s) =>
    `${s.firstname} ${s.lastname}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  return (
    <div className="students-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="students-content">
        <nav className="students-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>&gt;</span>
          <span style={{ color: "#888" }}>Students</span>
        </nav>

        <div className="students-title-row card">
          <div className="students-title-left">
            <div className="students-icon-wrapper">
              <span className="material-icons students-title-icon">groups</span>
            </div>
            <div>
              <div className="students-title">
                Student Performance Analytics
              </div>
              <div className="students-subtitle">
                Track and manage individual student records
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
              {searchQuery.length > 0 && (
                <span
                  className="material-icons clear-icon"
                  onClick={() => setSearchQuery("")}
                >
                  close
                </span>
              )}
            </div>
            <button className="students-add-btn" onClick={openAddModal}>
              <span
                className="material-icons"
                style={{ verticalAlign: "middle", marginRight: 6 }}
              >
                person_add
              </span>
              Add Student
            </button>
          </div>
        </div>

        <div className="students-main-row">
          <div className="students-main-col card">
            <div className="students-section-header">
              <div className="students-section-title">
                <span className="material-icons" style={{ marginRight: 8 }}>
                  people
                </span>
                Individual Students
              </div>
              <div className="search-results-info">
                Found {filteredStudents.length} student
                {filteredStudents.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="students-table">
              <div className="students-table-header">
                <span>Profile</span>
                <span>Name</span>
                <span>Password</span>
                <span>ID</span>
                <span>Actions</span>
              </div>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <div
                    className="students-table-row clickable-row"
                    key={student.id}
                  >
                    <div className="students-info">
                      <img
                        src={student.profilePic || people}
                        alt="Profile"
                        className="students-img"
                      />
                    </div>
                    <div className="students-name">
                      {student.firstname} {student.lastname}
                    </div>
                    <div className="students-password">{student.password}</div>
                    <div className="students-id">{student.id?.slice(-6)}</div>
                    <div className="students-action">
                      <button
                        className="actionBtn"
                        aria-label="Edit"
                        title="Edit"
                        onClick={() => openEditModal(student)}
                      >
                        <span
                          className="material-icons"
                          style={{ color: "#2196f3", fontSize: "22px" }}
                        >
                          edit
                        </span>
                      </button>
                      <button
                        className="actionBtn"
                        aria-label="Delete"
                        title="Delete"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <span
                          className="material-icons"
                          style={{ color: "#f44336", fontSize: "22px" }}
                        >
                          delete
                        </span>
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
                  (page) => (
                    <span
                      key={page}
                      className={`students-page${
                        currentPage === page ? " active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </span>
                  )
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
        <div className="modal-bg">
          <form
            className="modal"
            onSubmit={handleSaveStudent}
            autoComplete="off"
          >
            <h2>{modalMode === "add" ? "Add Student" : "Edit Student"}</h2>
            <label className="modal-label">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="modal-input"
            />
            {studentForm.profilePic && (
              <img
                src={studentForm.profilePic}
                alt="Preview"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 50,
                  marginTop: 8,
                  marginBottom: 8,
                }}
              />
            )}
            <label className="modal-label">First Name</label>
            <input
              className="modal-input"
              type="text"
              required
              value={studentForm.firstname}
              onChange={(e) =>
                setStudentForm((f) => ({ ...f, firstname: e.target.value }))
              }
            />
            <label className="modal-label">Last Name</label>
            <input
              className="modal-input"
              type="text"
              required
              value={studentForm.lastname}
              onChange={(e) =>
                setStudentForm((f) => ({ ...f, lastname: e.target.value }))
              }
            />
            <label className="modal-label">Password</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                className="modal-input"
                type="text"
                value={studentForm.password}
                readOnly
                aria-readonly="true"
              />
              <button
                type="button"
                className="students-add-btn"
                style={{
                  background: "#eee",
                  color: "#444",
                  fontWeight: "500",
                  padding: "8px 12px",
                }}
                onClick={() =>
                  setStudentForm((f) => ({ ...f, password: randomPassword() }))
                }
              >
                Generate
              </button>
            </div>
            <div className="modal-btn-row">
              <button
                type="button"
                className="students-add-btn"
                style={{ background: "#eee", color: "#444" }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="students-add-btn">
                {modalMode === "add" ? "Add" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Inline style exactly as Reports.js (can go at the end of the file) */}
      <style>{`
      .students-bg { min-height: 100vh; background: linear-gradient(108deg, #f4f7fe 0%, #e6edfa 100%); font-family: 'Poppins', 'Inter', Arial, sans-serif; }
      .students-content { max-width: 1280px; margin: 0 auto; padding: 36px 22px; }
      .card { background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(99, 123, 212, 0.10); margin-bottom: 22px; padding: 24px 24px 18px 24px;}
      .students-breadcrumb { font-size: 13px; color: #9296a1; padding: 10px 20px 10px 18px; display: flex; align-items: center; background: #f6f8fd; border-radius: 15px;}
      .students-title-row {display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;}
      .students-title-left {display: flex; align-items: center; gap: 15px;}
      .students-title-icon, .students-icon-wrapper .material-icons { font-size: 38px; background: #e5f1ff; border-radius: 50%; padding: 10px; color: #3973e5;}
      .students-title {font-size: 1.5rem; font-weight: 700; color: #292d35; margin-bottom: 2px;}
      .students-subtitle {font-size: 1.02rem; color: #7881a1; font-weight: 400;}
      .students-title-right {display: flex; gap: 14px; align-items: center; flex-wrap: wrap;}
      .students-search {background: #f3f7fb; border-radius: 8px; display: flex; align-items: center; padding: 5px 7px; gap: 5px; min-width: 185px; border: 1px solid #e4e8f1; position: relative;}
      .students-search input {border: none; background: transparent; outline: none; font-size: 15px; padding: 5px;width: 115px;}
      .search-icon {font-size: 20px; color: #6b90d6;}
      .clear-icon {font-size: 17px;color: #a9abc1;margin-left: 2px;cursor:pointer;}
      .students-add-btn {background: linear-gradient(92deg, #4975fa 0%, #62bffe 100%); color: #fff; border: none; border-radius: 8px; padding: 10px 26px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background .2s; box-shadow: 0 4px 14px rgba(75, 137, 225, 0.10); display: flex; align-items: center;}
      .students-add-btn:hover {background: linear-gradient(92deg, #3065f0 0%, #38b1fa 100%);}
      .students-main-row {display:flex; gap:30px; flex-wrap:wrap;}
      .students-main-col {flex: 1 1 700px; min-width:0;}
      .students-section-header {display: flex; justify-content: space-between; align-items:flex-start; font-size: 1.04rem; margin-bottom:10px;}
      .students-section-title { font-weight:700; color:#3b4a76; display:flex; align-items:center;}
      .search-results-info { color:#8d97b5; font-size:13px; font-weight:500; padding:2px 10px;}
      .students-table {display:flex; flex-direction:column; gap:0;}
      .students-table-header, .students-table-row {display: grid; grid-template-columns: 80px 1.2fr 1fr 1.2fr 1.1fr; align-items: center;}
      .students-table-header {background: #f7fafe; color:#4975fa; font-weight:600; border-radius:10px 10px 0 0; font-size: 15px; padding:10px 6px 10px 0;}
      .students-table-row {background:#fff; font-size:15px; border-bottom:1px solid #eef2fd; padding:13px 2px 13px 0; transition: background 0.12s;}
      .students-table-row:last-child { border-radius: 0 0 12px 12px; border-bottom: none;}
      .students-table-row.clickable-row:hover {background:#f5faff;}
      .students-info {display:flex; gap:11px; align-items:center;}
      .students-img {width:42px; height:42px; object-fit:cover; border-radius:100px; border:2px solid #e0e5fa;}
      .students-name {font-weight:500; font-size:15.4px;}
      .students-password, .students-id, .students-action {text-align:left; font-size:15px; color:#444; word-break:break-all;}
      .actionBtn {background:none; border:none; cursor:pointer; padding:8px 7px;}
      .actionBtn:focus {outline:2px solid #4975fa;}
      .no-results {display:flex; flex-direction:column; align-items:center; color:#9ba3b9; padding:34px 0 11px 0; font-size:15.5px;}
      .students-pagination {margin-top:20px; display:flex; align-items:center; gap:5px;}
      .page-nav {background:#f4f7fe; border:none; color:#4975fa; padding:5px 10px; border-radius:7px; cursor:pointer;}
      .page-nav:disabled {opacity:0.45; cursor:not-allowed;}
      .students-page { padding:6px 13px; border-radius:7px; background:#f5f7fd; color:#467cf6; font-weight:500; margin:0 2px; font-size:15px; cursor:pointer; transition: background .14s;}
      .students-page.active, .students-page:hover { background:#467cf6; color:#fff;}
      .modal-bg {position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:1001; background:rgba(44,52,89,0.14); display:flex; align-items:center; justify-content:center;}
      .modal {background:#fff; border-radius:14px; max-width:360px; min-width:270px; box-shadow:0 12px 44px rgba(89,122,235, 0.14); padding:29px 24px 20px 24px; display:flex; flex-direction:column; gap:9px; position:relative;}
      .modal-label {font-size:14.5px; color:#323B5B; margin-top:5px;}
      .modal-input {padding:9px 10px; border: 1.4px solid #d8e0f7; border-radius:7.4px; font-size:15px; margin-bottom:10px; outline:none;}
      .modal-btn-row {display:flex; gap:14px; margin-top:19px; justify-content:flex-end;}
      @media (max-width:860px) {
        .students-content, .card { padding:10px 7px;}
        .students-title { font-size: 1.04rem; }
        .students-section-header { font-size: 0.98rem }
        .students-title-icon { font-size:28px; }
        .students-main-row { gap:12px }
        .students-table-header, .students-table-row { grid-template-columns: 72px 1.2fr 1fr 1.2fr 1.1fr; font-size:13.6px;}
      }
      @media (max-width:650px) {
        .card {padding:7px 1.5vw 10px 1.5vw;}
        .students-content { padding:9px 0.5vw;}
        .students-title-row, .students-section-header {flex-direction:column; align-items:flex-start; gap:8px;}
        .students-table-header, .students-table-row { grid-template-columns:55px 1.6fr 1fr 1fr; font-size:12.2px;}
      }
      `}</style>
    </div>
  );
}

export default Students;
