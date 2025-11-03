import { useEffect, useState } from "react";
import { usuariosAPI } from "../../services/api.js";

export default function UsuariosAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await usuariosAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onToggle = async (u) => {
    try {
      setSuccess("");
      setError("");
      if (u.activo) {
        await usuariosAPI.deactivate(u.id_usuario);
        setSuccess("Usuario desactivado");
      } else {
        await usuariosAPI.activate(u.id_usuario);
        setSuccess("Usuario activado");
      }
      fetchData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || err.message || "Acción no disponible (falta endpoint en backend)");
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-3">Administración de Usuarios</h2>
      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading && <p className="text-muted">Cargando usuarios...</p>}

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Activo</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">No hay usuarios</td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.dni}</td>
                  <td>{u.activo ? 'Sí' : 'No'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => onToggle(u)}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

