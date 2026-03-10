import { useState } from "react";

const LeftPanel = ({ onClose }: { onClose: () => void }) => (
  <div style={{
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 40%, #1a0a2e 70%, #0a1628 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  }}>
    <img
      src="/images/vr-brain.png" // Place the attached image in public/images/vr-brain.png
      alt="VR Brain"
      style={{
        width: "90%",
        height: "90%",
        objectFit: "cover",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
      }}
    />
    {/* Back arrow */}
    <button onClick={onClose} style={{
      position: "absolute",
      top: "20px",
      left: "20px",
      background: "rgba(255,255,255,0.8)",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      cursor: "pointer",
      fontSize: "20px",
      color: "#666",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 10,
    }}>←</button>
  </div>
);

export default function AuthInterface({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState("signup"); // "signup" or "login"
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: ""
  });

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    border: "1.5px solid #e8e8e8",
    borderRadius: "50px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#333",
    background: "white",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: #aaa; }
        input:focus { border-color: #333 !important; }
        .social-btn:hover { background: #f5f5f5 !important; }
        .link-btn { color: #333; font-weight: 600; text-decoration: underline; cursor: pointer; background: none; border: none; font-family: inherit; font-size: inherit; }
        .link-btn:hover { opacity: 0.7; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .form-animate { animation: fadeIn 0.4s ease forwards; }
        
        .modal-container {
          width: 900px;
          max-width: 98vw;
          height: 650px;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          display: flex;
          overflow: hidden;
        }
        
        .left-panel-container {
          width: 45%;
          height: 100%;
          border-radius: 0 24px 24px 0;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .right-panel-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 60px;
          overflow-y: auto;
        }
        
        @media (max-width: 768px) {
          .modal-container {
            flex-direction: column;
            height: auto;
            width: 95vw;
            max-width: 95vw;
            max-height: 90vh;
            overflow-y: auto;
          }
          
          .left-panel-container {
            width: 100%;
            height: 250px;
            border-radius: 24px 24px 0 0;
            flex-shrink: 0;
          }
          
          .right-panel-container {
            width: 100%;
            padding: 32px 24px;
            flex: 1;
            overflow-y: auto;
          }
          
          h1 {
            font-size: 28px !important;
          }
        }
      `}</style>
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div className="modal-container">
          {/* LEFT PANEL - Image */}
          <div className="left-panel-container">
            <LeftPanel onClose={onClose} />
          </div>

          {/* RIGHT PANEL - Form */}
          <div className="right-panel-container">
            <div className="form-animate" key={mode}>
              {/* Title */}
              <h1 style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: "38px",
                fontWeight: "800",
                color: "#111",
                marginBottom: "8px",
                lineHeight: "1.1",
              }}>
                {mode === "signup" ? "Create an Account" : "Welcome Back"}
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>
                {mode === "signup" ? (
                  <>Already have an account?{" "}
                    <button className="link-btn" onClick={() => setMode("login")}>Log in</button>
                  </>
                ) : (
                  <>Don't have an account?{" "}
                    <button className="link-btn" onClick={() => setMode("signup")}>Sign up</button>
                  </>
                )}
              </p>

              {/* Form fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {mode === "signup" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "7px", fontWeight: "500" }}>
                        First Name
                      </label>
                      <input
                        style={inputStyle as any}
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "7px", fontWeight: "500" }}>
                        Last Name
                      </label>
                      <input
                        style={inputStyle as any}
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "7px", fontWeight: "500" }}>
                    Email Address
                  </label>
                  <input
                    style={inputStyle as any}
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "7px", fontWeight: "500" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={{ ...inputStyle, paddingRight: "48px" } as any}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} style={{
                      position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "18px",
                    }}>
                      {showPassword ? "👁" : "🙈"}
                    </button>
                  </div>
                </div>

                {mode === "login" && (
                  <div style={{ textAlign: "right" }}>
                    <button className="link-btn" style={{ fontSize: "13px" }}>Forgot password?</button>
                  </div>
                )}

                {/* CTA Button */}
                <button style={{
                  width: "100%",
                  padding: "16px",
                  background: "#111",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "15px",
                  fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  marginTop: "4px",
                  transition: "background 0.2s, transform 0.1s",
                }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.background = "#333"}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.background = "#111"}
                  onMouseDown={(e) => (e.target as HTMLElement).style.transform = "scale(0.98)"}
                  onMouseUp={(e) => (e.target as HTMLElement).style.transform = "scale(1)"}
                >
                  {mode === "signup" ? "Create Account" : "Log In"}
                </button>

                {/* Terms */}
                {mode === "signup" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      onClick={() => setAgreed(!agreed)}
                      style={{
                        width: "20px", height: "20px", borderRadius: "5px",
                        background: agreed ? "#111" : "white",
                        border: agreed ? "none" : "2px solid #ccc",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      {agreed && <span style={{ color: "white", fontSize: "12px", fontWeight: "700" }}>✓</span>}
                    </div>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      I agree to the{" "}
                      <button className="link-btn" style={{ fontSize: "13px" }}>Terms & Condition</button>
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
                  <span style={{ fontSize: "13px", color: "#aaa" }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: "#e8e8e8" }} />
                </div>

                {/* Social Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button className="social-btn" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "13px 16px", border: "1.5px solid #e8e8e8", borderRadius: "50px",
                    background: "white", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                    fontWeight: "500", color: "#333",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button className="social-btn" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "13px 16px", border: "1.5px solid #e8e8e8", borderRadius: "50px",
                    background: "white", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
                    fontWeight: "500", color: "#333",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}