import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    dni: "",
    fecha_nacimiento: "",
    direccion: "",
  });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("Usuario registrado exitosamente");
        try {
          if (data && data.id_usuario) {
            login({ id_usuario: data.id_usuario, nombre: data.nombre, email: data.email });
            navigate("/mis-turnos");
          }
        } catch {}
        setFormData({
          nombre: "",
          apellido: "",
          email: "",
          password: "",
          telefono: "",
          dni: "",
          fecha_nacimiento: "",
          direccion: "",
        });
      } else {
        setMensaje(data.detail || "Error al registrar");
      }
    } catch (error) {
      setMensaje("Error de conexión: " + error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Registrarse</h2>

      {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Apellido</label>
          <input type="text" name="apellido" className="form-control" value={formData.apellido} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">DNI</label>
          <input type="text" name="dni" className="form-control" value={formData.dni} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fecha de nacimiento</label>
          <input type="date" name="fecha_nacimiento" className="form-control" value={formData.fecha_nacimiento} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label">Dirección</label>
          <input type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label">Contraseña</label>
          <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Registrarse</button>
        </div>
      </form>

      <p className="mt-3">¿Ya tenés cuenta? <a href="/login">Iniciá sesión acá</a></p>
    </div>
  );
}

