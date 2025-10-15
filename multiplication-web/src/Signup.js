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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        firstname,
        lastname,
        username,
        email,
      });

      setSuccess("Account created successfully!");

      if (onSignup) {
        onSignup({
          firstname,
          lastname,
          username,
          email,
          uid: user.uid,
        });
      }

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="signup-bg">
      <img src={overlay} alt="" className="signup-overlay" />
      <div className="signup-floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      <div className="signup-container">
        <div className="signup-left">
          <div className="logo-wrapper">
            <img src={logo} alt="Multiplication Logo" className="signup-logo" />
          </div>
        </div>
        <div className="signup-right">
          <form
            className="signup-form"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>
                  <span className="label-text">First Name</span>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">person</span>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span className="label-text">Last Name</span>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">
                      person_outline
                    </span>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="input-group">
              <label>
                <span className="label-text">Username</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">
                    account_circle
                  </span>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </label>
            </div>

            <div className="input-group">
              <label>
                <span className="label-text">Email</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">email</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>
                  <span className="label-text">Password</span>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <span className="material-icons">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </label>
              </div>

              <div className="input-group">
                <label>
                  <span className="label-text">Confirm Password</span>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">
                      lock_outline
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex="-1"
                    >
                      <span className="material-icons">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="material-icons">check_circle</span>
                {success}
              </div>
            )}

            <div className="signup-login">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
              >
                Sign In
              </a>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  <span className="material-icons">person_add</span>
                  SIGN UP
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .signup-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(180deg, #60A5FA 0%, #A78BFA 50%, #F864D3 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          padding: 40px 0;
        }
        
        .signup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
          animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        .signup-floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        
        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          animation: float-shapes 15s ease-in-out infinite;
        }
        
        .shape-1 {
          width: 150px;
          height: 150px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 100px;
          height: 100px;
          top: 70%;
          left: 80%;
          animation-delay: 2s;
        }
        
        .shape-3 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 5%;
          animation-delay: 4s;
        }
        
        .shape-4 {
          width: 120px;
          height: 120px;
          top: 20%;
          right: 10%;
          animation-delay: 6s;
        }
        
        @keyframes float-shapes {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.1;
          }
          50% { 
            transform: translateY(-30px) translateX(20px) scale(1.1);
            opacity: 0.2;
          }
        }
        
        .signup-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 60px;
          width: 1200px;
          max-width: 95vw;
          padding: 20px;
        }
        
        .signup-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-wrapper {
          text-align: center;
          animation: slideInLeft 0.8s ease-out;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .signup-logo {
          max-width: 380px;
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
          animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .signup-welcome {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-top: 30px;
          text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .signup-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.95);
          margin-top: 10px;
          font-weight: 400;
        }
        
        .signup-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .signup-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          padding: 40px;
          width: 100%;
          max-width: 550px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: slideInRight 0.8s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .form-header {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .form-header h2 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60A5FA, #F864D3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .form-header p {
          font-size: 0.9rem;
          color: #666;
          font-weight: 400;
        }
        
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .input-group {
          margin-bottom: 0;
        }
        
        .label-text {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          margin-bottom: 8px;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-icon {
          position: absolute;
          left: 14px;
          color: #A78BFA;
          font-size: 20px;
          z-index: 1;
        }
        
        .signup-form input {
          width: 100%;
          padding: 12px 12px 12px 46px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background: white;
          font-family: 'Poppins', sans-serif;
        }
        
        .signup-form input:focus {
          border-color: #A78BFA;
          box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.1);
          transform: translateY(-2px);
        }
        
        .signup-form input::placeholder {
          color: #9CA3AF;
        }
        
        .eye-button {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          transition: color 0.2s ease;
          z-index: 1;
        }
        
        .eye-button:hover {
          color: #A78BFA;
        }
        
        .eye-button .material-icons {
          font-size: 20px;
        }
        
        .error-message {
          background: #FEE2E2;
          color: #DC2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 4px solid #DC2626;
          animation: shake 0.5s ease;
        }
        
        .success-message {
          background: #D1FAE5;
          color: #059669;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 4px solid #059669;
          animation: slideInDown 0.5s ease;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .error-message .material-icons,
        .success-message .material-icons {
          font-size: 18px;
        }
        
        .signup-login {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin: 4px 0;
          font-weight: 400;
        }
        
        .signup-login a {
          color: #60A5FA;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        
        .signup-login a:hover {
          color: #A78BFA;
          text-decoration: underline;
        }
        
        .signup-btn {
          background: linear-gradient(135deg, #60A5FA, #F864D3);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 0;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);
          font-family: 'Poppins', sans-serif;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .signup-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(96, 165, 250, 0.5);
        }
        
        .signup-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .signup-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .signup-btn .material-icons {
          font-size: 20px;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          .signup-container {
            gap: 40px;
          }
          
          .signup-welcome {
            font-size: 2rem;
          }
          
          .signup-subtitle {
            font-size: 1rem;
          }
          
          .signup-form {
            max-width: 500px;
          }
        }
        
        @media (max-width: 768px) {
          .signup-container {
            flex-direction: column;
            gap: 30px;
            padding: 20px;
          }
          
          .signup-left {
            width: 100%;
          }
          
          .signup-logo {
            max-width: 280px;
          }
          
          .signup-welcome {
            font-size: 1.8rem;
            margin-top: 20px;
          }
          
          .signup-subtitle {
            font-size: 0.95rem;
          }
          
          .signup-form {
            padding: 32px 24px;
            max-width: 100%;
          }
          
          .form-header h2 {
            font-size: 1.6rem;
          }
          
          .input-row {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          
          .shape {
            opacity: 0.5;
          }
        }
        
        @media (max-width: 480px) {
          .signup-bg {
            padding: 20px 0;
          }
          
          .signup-logo {
            max-width: 240px;
          }
          
          .signup-welcome {
            font-size: 1.5rem;
          }
          
          .signup-subtitle {
            font-size: 0.85rem;
          }
          
          .signup-form {
            padding: 24px 20px;
            gap: 14px;
          }
          
          .form-header h2 {
            font-size: 1.4rem;
          }
          
          .signup-form input {
            padding: 11px 11px 11px 42px;
            font-size: 13px;
          }
          
          .label-text {
            font-size: 12px;
          }
          
          .signup-btn {
            padding: 12px 0;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;
