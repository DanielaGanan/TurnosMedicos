import { useEffect, useState } from "react";
import { especialidadesAPI } from "../services/api.js";

export default function Especialidades() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ nombre: "", descripcion: "", activo: true });
  const [editingId, setEditingId] = useState(null);

  const normalizeDetail = (detail) => {
    if (!detail) return "";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const parts = detail.map((e) => (e && e.msg) ? e.msg : String(e));
      return parts.join("; ");
    }
    if (typeof detail === "object") return detail.msg || JSON.stringify(detail);
    try { return String(detail); } catch { return ""; }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await especialidadesAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al cargar especialidades"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const clearForm = () => {
    setForm({ nombre: "", descripcion: "", activo: true });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const payload = { ...form };
    try {
      if (!payload.nombre) {
        setError("Completá el nombre");
        return;
      }
      if (editingId) {
        await especialidadesAPI.update(editingId, payload);
        setSuccess("Especialidad actualizada");
      } else {
        await especialidadesAPI.create(payload);
        setSuccess("Especialidad creada");
      }
      clearForm();
      fetchData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al guardar"));
    }
  };

  const onEdit = (esp) => {
    setEditingId(esp.id_especialidad);
    setForm({ nombre: esp.nombre || "", descripcion: esp.descripcion || "", activo: !!esp.activo });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("¿Eliminar esta especialidad?")) return;
    try {
      await especialidadesAPI.delete(id);
      setSuccess("Especialidad eliminada");
      fetchData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al eliminar"));
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Especialidades</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? "Editar especialidad" : "Nueva especialidad"}</h5>
          {success && <div className="alert alert-success py-2">{success}</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form className="row g-3" onSubmit={onFormSubmit}>
            <div className="col-md-4">
              <label className="form-label">Nombre</label>
              <input type="text" name="nombre" className="form-control" value={form.nombre} onChange={onFormChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Descripción</label>
              <input type="text" name="descripcion" className="form-control" value={form.descripcion} onChange={onFormChange} />
            </div>
            <div className="col-md-2 d-flex align-items-center">
              <div className="form-check mt-4">
                <input className="form-check-input" type="checkbox" id="esp-activo" name="activo" checked={!!form.activo} onChange={onFormChange} />
                <label className="form-check-label" htmlFor="esp-activo">Activo</label>
              </div>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" type="submit">{editingId ? "Guardar cambios" : "Crear"}</button>
              <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>Limpiar</button>
            </div>
          </form>
        </div>
      </div>

      {loading && <p className="text-muted">Cargando especialidades...</p>}

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Activo</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">No hay especialidades</td>
              </tr>
            ) : (
              items.map((esp) => (
                <tr key={esp.id_especialidad}>
                  <td>{esp.id_especialidad}</td>
                  <td>{esp.nombre}</td>
                  <td>{esp.descripcion || '-'}</td>
                  <td>{esp.activo ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-outline-light" onClick={() => onEdit(esp)}>Editar</button>
                      <button className="btn btn-outline-danger" onClick={() => onDelete(esp.id_especialidad)}>Eliminar</button>
                    </div>
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

