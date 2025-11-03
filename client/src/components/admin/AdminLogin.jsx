import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const { isAdmin, loginAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) navigate("/admin/usuarios");
  }, [isAdmin, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    // Validación temporal en frontend (reemplazar por backend con roles)
    if ((usuario === "admin" || usuario === "admin@turnos.local") && password === "admin") {
      loginAdmin();
      navigate("/admin/usuarios");
    } else {
      setMsg("Credenciales inválidas");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Acceso Administrador</h2>
      {msg && <div className="alert alert-danger py-2">{msg}</div>}
      <form className="row g-3" onSubmit={onSubmit}>
        <div className="col-md-6">
          <label className="form-label">Usuario o Email</label>
          <input type="text" className="form-control" value={usuario} onChange={(e)=>setUsuario(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Contraseña</label>
          <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Ingresar</button>
        </div>
      </form>
    </div>
  );
}

