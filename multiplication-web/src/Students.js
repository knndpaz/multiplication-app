import React, { useState, useEffect } from "react";
import Header from "./Header";
import people from "./assets/people.png";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const db = getFirestore();

function randomPassword() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function Students({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [studentForm, setStudentForm] = useState({
    firstname: "",
    lastname: "",
    password: randomPassword(),
    profilePic: "",
  });
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    async function fetchStudents() {
      if (!user?.uid) return;
      const snap = await getDocs(collection(db, "students", user.uid, "list"));
      const arr = [];
      snap.forEach(doc => arr.push({ ...doc.data(), id: doc.id }));
      setStudents(arr);
    }
    fetchStudents();
  }, [user]);

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
    if (!studentForm.firstname || !studentForm.lastname || !studentForm.password) return;
    if (modalMode === "add") {
      await addDoc(collection(db, "students", user.uid, "list"), {
        ...studentForm,
        createdAt: new Date().toISOString(),
      });
    } else if (modalMode === "edit" && selectedStudentId) {
      await updateDoc(doc(db, "students", user.uid, "list", selectedStudentId), {
        ...studentForm,
        updatedAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
    // Refresh list
    const snap = await getDocs(collection(db, "students", user.uid, "list"));
    const arr = [];
    snap.forEach(doc => arr.push({ ...doc.data(), id: doc.id }));
    setStudents(arr);
  }

  async function handleDeleteStudent(id) {
    await deleteDoc(doc(db, "students", user.uid, "list", id));
    setStudents(students.filter(s => s.id !== id));
  }

  function handleProfilePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      setStudentForm(form => ({ ...form, profilePic: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="students-bg">
      <Header user={user} onLogout={onLogout} />
      <div className="students-content">
        <div className="students-breadcrumb card">
          <span>Dashboard</span>
          <span style={{ margin: "0 8px", color: "#bbb" }}>{'>'}</span>
          <span style={{ color: "#888" }}>Students</span>
        </div>
        <div className="students-title-row card">
          <div className="students-title-left">
            <span className="material-icons students-title-icon" style={{ fontSize: 44, color: "#a259ff", marginRight: 12 }}>person</span>
            <div className="students-title">Student Performance Analytics</div>
          </div>
          <div className="students-title-right">
            <button className="students-add-btn" onClick={openAddModal}>Add Student</button>
            <div className="students-search">
              <input placeholder="Search Student" />
              <span className="material-icons">search</span>
            </div>
          </div>
        </div>
        <div className="students-table card">
          <div className="students-table-header">
            <span>Profile</span>
            <span>Name</span>
            <span>Password</span>
            <span></span>
          </div>
          {students.map(student => (
            <div className="students-table-row" key={student.id}>
              <div className="students-info">
                <img src={student.profilePic || people} alt="" className="students-img" />
              </div>
              <span className="students-name">{student.firstname} {student.lastname}</span>
              <span className="students-password">
                {student.password}
              </span>
              <span className="students-actions">
                <button className="students-action-btn edit" onClick={() => openEditModal(student)}><span className="material-icons">edit</span></button>
                <button className="students-action-btn delete" onClick={() => handleDeleteStudent(student.id)}><span className="material-icons">delete</span></button>
              </span>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="students-modal-bg">
          <div className="students-modal">
            <form onSubmit={handleSaveStudent}>
              <h2 style={{ marginBottom: 18 }}>{modalMode === "add" ? "Add Student" : "Edit Student"}</h2>
              <label style={{ marginBottom: 10 }}>
                Profile Picture<br />
                <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                {studentForm.profilePic && (
                  <img src={studentForm.profilePic} alt="Preview" style={{ width: 48, height: 48, borderRadius: "50%", marginTop: 8 }} />
                )}
              </label>
              <label>
                First Name<br />
                <input
                  className="game-editor-input"
                  type="text"
                  value={studentForm.firstname}
                  onChange={e => setStudentForm(f => ({ ...f, firstname: e.target.value }))}
                  required
                />
              </label>
              <label>
                Last Name<br />
                <input
                  className="game-editor-input"
                  type="text"
                  value={studentForm.lastname}
                  onChange={e => setStudentForm(f => ({ ...f, lastname: e.target.value }))}
                  required
                />
              </label>
              <label>
                Password<br />
                <input
                  className="game-editor-input"
                  type="text"
                  value={studentForm.password}
                  readOnly
                  style={{ background: "#eee" }}
                />
                <button type="button" style={{ marginTop: 6, marginBottom: 10 }} onClick={() => setStudentForm(f => ({ ...f, password: randomPassword() }))}>
                  Generate New Password
                </button>
              </label>
              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button type="button" className="students-add-btn" style={{ background: "#eee", color: "#444" }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="students-add-btn">{modalMode === "add" ? "Add" : "Save"}</button>
              </div>
            </form>
          </div>
          <style>{`
            .students-modal-bg {
              position: fixed;
              top: 0; left: 0; width: 100vw; height: 100vh;
              background: rgba(0,0,0,0.18);
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .students-modal {
              background: #fff;
              border-radius: 18px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.12);
              padding: 32px 38px;
              min-width: 340px;
              max-width: 95vw;
              width: 100%;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .students-modal label {
              font-size: 15px;
              color: #444;
              margin-bottom: 8px;
              display: block;
            }
            .students-modal input[type="text"] {
              padding: 10px 12px;
              border: 1.5px solid #e0e0e0;
              border-radius: 7px;
              font-size: 15px;
              outline: none;
              margin-top: 4px;
              width: 100%;
            }
            .students-modal input[type="file"] {
              margin-top: 4px;
            }
            .students-modal button {
              border: none;
              border-radius: 8px;
              padding: 10px 22px;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
            }
          `}</style>
        </div>
      )}
      <style>{`
        .students-bg {
          min-height: 100vh;
          background: #EAEAEA;
          padding: 0;
        }
        .students-content {
          padding: 32px 24px 24px 24px;
          max-width: 1300px;
          margin: 0 auto;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 22px 32px;
          margin-bottom: 18px;
        }
        .students-breadcrumb {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #444;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          font-family: 'Inter', Arial, sans-serif;
          font-weight: 500;
          letter-spacing: 0.01em;
          margin-bottom: 18px;
          padding: 12px 18px;
        }
        .students-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .students-title-left {
          display: flex;
          align-items: center;
        }
        .students-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #222;
        }
        .students-title-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .students-add-btn {
          background: #19d419;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 8px;
        }
        .students-search {
          display: flex;
          align-items: center;
          background: #eaeaea;
          border-radius: 7px;
          padding: 4px 10px;
        }
        .students-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          width: 140px;
        }
        .students-search .material-icons {
          font-size: 20px;
          color: #888;
        }
        .students-table {
          padding: 0;
        }
        .students-table-header {
          display: flex;
          align-items: center;
          background: #f7f7f7;
          border-radius: 12px 12px 0 0;
          font-size: 14px;
          color: #444;
          font-weight: 600;
          padding: 18px 32px;
          gap: 0;
        }
        .students-table-header span,
        .students-table-row > div,
        .students-table-row > span {
          flex: 1 1 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .students-table-row {
          display: flex;
          align-items: center;
          padding: 18px 32px;
          border-bottom: 1px solid #eee;
        }
        .students-table-row:last-child {
          border-bottom: none;
        }
        .students-info {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          justify-content: flex-start;
        }
        .students-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }
        .students-name {
          justify-content: flex-start;
          font-weight: 500;
          color: #222;
        }
        .students-id {
          flex: 1;
          color: #888;
          font-size: 13px;
        }
        .students-password {
          justify-content: center;
          color: #444;
          font-size: 15px;
        }
        .students-eye {
          font-size: 18px;
          color: #888;
          cursor: pointer;
        }
        .students-actions {
          justify-content: center;
          gap: 8px;
        }
        .students-action-btn {
          border: none;
          background: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          font-size: 18px;
        }
        .students-action-btn.edit {
          color: #ffb300;
          background: #fffbe6;
        }
        .students-action-btn.delete {
          color: #ff4444;
          background: #ffeaea;
        }
        @media (max-width: 900px) {
          .students-content {
            padding: 10px 2vw;
          }
          .card {
            padding: 12px 6px;
          }
          .students-table-header, .students-table-row {
            padding-left: 10px;
            padding-right: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Students;