import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("admin@clinic.com");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (email === "admin@clinic.com" && password === "admin") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  if (isLoggedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>Welcome to DentAI Dashboard</h1>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f4f6f8"
    }}>
      <div style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "320px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center" }}>DentAI</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Access ID"
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Security Key"
            style={{ width: "100%", marginBottom: "15px", padding: "10px" }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px"
            }}
          >
            Initialize System
          </button>
        </form>
      </div>
    </div>
  );
}