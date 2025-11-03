import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TablaUsuarios from "./TablaUsuarios.jsx";
import { usuariosAPI } from "../services/api.js";
import "../styles/colors.css";

export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await usuariosAPI.getAll();
        setUsuarios(data);
      } catch (err) {
        const detail = err?.response?.data?.detail;
        setError(detail || err.message || "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">Bienvenido a Turnos Médicos</h1>
        <p className="text-muted">Gestioná tus turnos y consultá médicos de manera rápida y sencilla.</p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/login" className="btn btn-outline-primary px-4">
            Iniciar Sesión
          </Link>
          <Link to="/registro" className="btn btn-primary px-4">
            Registrarse
          </Link>
        </div>
      </div>

      <hr className="my-4" />

      <h2 className="text-center text-secondary mb-3">Lista de Usuarios</h2>
      {loading && <p className="text-center text-muted">Cargando usuarios...</p>}
      {error && <p className="text-center text-danger">Error: {error}</p>}
      {!loading && !error && usuarios.length > 0 ? (
        <TablaUsuarios usuarios={usuarios} />
      ) : (
        !loading && <p className="text-center text-muted">No hay usuarios registrados.</p>
      )}
    </div>
  );
}

