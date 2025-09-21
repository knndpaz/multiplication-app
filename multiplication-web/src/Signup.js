import React, { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import logo from "./assets/logo.png";
import overlay from "./assets/overlay.png";
import { useNavigate } from "react-router-dom";

const db = getFirestore();

function Signup({ onSignup }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!firstname || !lastname || !username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      // Save extra info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstname,
        lastname,
        username,
        email,
      });
      setSuccess("Account created! You can now log in.");
      if (onSignup) onSignup({
        firstname,
        lastname,
        username,
        email,
        uid: user.uid,
      });
      // Optionally, navigate to dashboard
      // navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  }

  return (
    <div className="login-bg">
      <img src={overlay} alt="" className="login-overlay" />
      <div className="login-container">
        <div className="login-left">
          <img src={logo} alt="Multiplication Logo" className="login-logo" />
        </div>
        <div className="login-right">
          <form className="login-form" autoComplete="off" onSubmit={handleSubmit}>
            <label>
              <span>First Name</span>
              <input
                type="text"
                placeholder="Enter First Name"
                value={firstname}
                onChange={e => setFirstname(e.target.value)}
              />
            </label>
            <label>
              <span>Last Name</span>
              <input
                type="text"
                placeholder="Enter Last Name"
                value={lastname}
                onChange={e => setLastname(e.target.value)}
              />
            </label>
            <label>
              <span>Username</span>
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
            <label>
              <span>Confirm Password</span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </label>
            {error && <div style={{ color: "red", fontSize: 13 }}>{error}</div>}
            {success && <div style={{ color: "green", fontSize: 13 }}>{success}</div>}
            <div className="login-signup">
              <span>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    navigate("/");
                  }}
                >
                  Login
                </a>
              </span>
            </div>
            <button type="submit" className="login-btn">
              <span style={{ marginRight: 8 }}>⮞</span> SIGN UP
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .login-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #4fd1ff 0%, #ff61d2 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-overlay {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100vh;
          object-fit: cover;
          opacity: 0.5;
          z-index: 0;
          pointer-events: none;
        }
        .login-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 900px;
          max-width: 95vw;
        }
        .login-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-logo {
          max-width: 340px;
          width: 90%;
          height: auto;
          display: block;
        }
        .login-right {
          flex: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-form {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          padding: 40px 32px 32px 32px;
          min-width: 340px;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .login-form label {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          color: #444;
          gap: 6px;
        }
        .login-form input {
          padding: 12px 10px;
          border: 1.5px solid #e0e0e0;
          border-radius: 7px;
          font-size: 15px;
          outline: none;
          transition: border 0.2s;
        }
        .login-form input:focus {
          border-color: #4fd1ff;
        }
        .login-signup {
          text-align: right;
          font-size: 12px;
          color: #888;
          margin-bottom: 8px;
        }
        .login-signup a {
          color: #ff61d2;
          text-decoration: none;
          font-weight: 500;
        }
        .login-btn {
          background: #ff7e5f;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 0;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(255,126,95,0.12);
        }
        .login-btn:hover {
          background: #ff61d2;
        }
        @media (max-width: 800px) {
          .login-container {
            flex-direction: column;
            width: 98vw;
          }
          .login-left {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;