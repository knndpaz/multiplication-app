import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import logo from "./assets/logo.png";
import overlay from "./assets/overlay.png";

const db = getFirestore();

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let profile = {
        firstname: "",
        lastname: "",
        username: "",
        email: user.email,
        uid: user.uid,
      };
      if (userDoc.exists()) {
        const data = userDoc.data();
        profile.firstname = data.firstname;
        profile.lastname = data.lastname;
        profile.username = data.username;
      }
      onLogin(profile);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <img src={overlay} alt="" className="login-overlay" />
      <div className="login-floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      <div className="login-container">
        <div className="login-left">
          <div className="logo-wrapper">
            <img src={logo} alt="Multiplication Logo" className="login-logo" />
            <h1 className="login-welcome">Welcome Back!</h1>
            <p className="login-subtitle">
              Let's continue learning multiplication together
            </p>
          </div>
        </div>
        <div className="login-right">
          <form
            className="login-form"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>
            <div className="input-group">
              <label>
                <span className="label-text">Email/Username</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">person</span>
                  <input
                    type="text"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>
            </div>
            <div className="input-group">
              <label>
                <span className="label-text">Password</span>
                <div className="input-wrapper">
                  <span className="material-icons input-icon">lock</span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </label>
            </div>
            {error && (
              <div className="error-message">
                <span className="material-icons">error</span>
                {error}
              </div>
            )}
            <div className="login-signup">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}
              >
                Sign Up
              </a>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-icons">login</span>
                  LOGIN
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
        
        .login-bg {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(180deg, #F864D3 0%, #A78BFA 50%, #60A5FA 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
        }
        
        .login-overlay {
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
        
        .login-floating-shapes {
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
        
        .login-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 60px;
          width: 1100px;
          max-width: 95vw;
          padding: 40px 20px;
        }
        
        .login-left {
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
        
        .login-logo {
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
        
        .login-welcome {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-top: 30px;
          text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .login-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.95);
          margin-top: 10px;
          font-weight: 400;
        }
        
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .login-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          padding: 40px;
          width: 100%;
          max-width: 450px;
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          background: linear-gradient(135deg, #F864D3, #60A5FA);
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
        
        .input-group {
          margin-bottom: 4px;
        }
        
        .label-text {
          display: block;
          font-size: 14px;
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
        
        .login-form input {
          width: 100%;
          padding: 14px 14px 14px 46px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          background: white;
          font-family: 'Poppins', sans-serif;
        }
        
        .login-form input:focus {
          border-color: #A78BFA;
          box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.1);
          transform: translateY(-2px);
        }
        
        .login-form input::placeholder {
          color: #9CA3AF;
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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .error-message .material-icons {
          font-size: 18px;
        }
        
        .login-signup {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin: 4px 0;
          font-weight: 400;
        }
        
        .login-signup a {
          color: #F864D3;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        
        .login-signup a:hover {
          color: #A78BFA;
          text-decoration: underline;
        }
        
        .login-btn {
          background: linear-gradient(135deg, #F864D3, #A78BFA);
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
          box-shadow: 0 4px 15px rgba(248, 100, 211, 0.4);
          font-family: 'Poppins', sans-serif;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(248, 100, 211, 0.5);
        }
        
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .login-btn .material-icons {
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
          .login-container {
            gap: 40px;
          }
          
          .login-welcome {
            font-size: 2rem;
          }
          
          .login-subtitle {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            gap: 30px;
            padding: 20px;
          }
          
          .login-left {
            width: 100%;
          }
          
          .login-logo {
            max-width: 280px;
          }
          
          .login-welcome {
            font-size: 1.8rem;
            margin-top: 20px;
          }
          
          .login-subtitle {
            font-size: 0.95rem;
          }
          
          .login-form {
            padding: 32px 24px;
            max-width: 100%;
          }
          
          .form-header h2 {
            font-size: 1.6rem;
          }
          
          .shape {
            opacity: 0.5;
          }
        }
        
        @media (max-width: 480px) {
          .login-logo {
            max-width: 240px;
          }
          
          .login-welcome {
            font-size: 1.5rem;
          }
          
          .login-subtitle {
            font-size: 0.85rem;
          }
          
          .login-form {
            padding: 24px 20px;
          }
          
          .form-header h2 {
            font-size: 1.4rem;
          }
          
          .login-form input {
            padding: 12px 12px 12px 42px;
            font-size: 14px;
          }
          
          .login-btn {
            padding: 12px 0;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
