import { useEffect, useMemo, useState } from "react";
import { medicosAPI, especialidadesAPI } from "../services/api.js";

export default function Medicos() {
  const [items, setItems] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filtroEsp, setFiltroEsp] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    id_especialidad: "",
    matricula: "",
    email: "",
    telefono: "",
    activo: true,
  });

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

  const fetchData = async (id_especialidad = null) => {
    setLoading(true);
    setError("");
    try {
      const data = await medicosAPI.getAll(id_especialidad);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al cargar médicos"));
    } finally {
      setLoading(false);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const data = await especialidadesAPI.getAll();
      setEspecialidades(Array.isArray(data) ? data : []);
    } catch (err) {
      setEspecialidades([]);
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al cargar especialidades"));
    }
  };

  useEffect(() => {
    fetchData();
    fetchEspecialidades();
  }, []);

  const onFilterSubmit = (e) => {
    e.preventDefault();
    const id = filtroEsp ? Number(filtroEsp) : null;
    fetchData(id);
  };

  const onFilterClear = () => {
    setFiltroEsp("");
    fetchData();
  };

  const onFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const clearForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      id_especialidad: "",
      matricula: "",
      email: "",
      telefono: "",
      activo: true,
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const payload = {
      ...form,
      id_especialidad: Number(form.id_especialidad),
    };
    try {
      if (!payload.nombre || !payload.apellido || !payload.id_especialidad || !payload.matricula || !payload.email) {
        setError("Completá los campos obligatorios");
        return;
      }
      if (editingId) {
        await medicosAPI.update(editingId, payload);
        setSuccess("Médico actualizado");
      } else {
        await medicosAPI.create(payload);
        setSuccess("Médico creado");
      }
      clearForm();
      const id = filtroEsp ? Number(filtroEsp) : null;
      fetchData(id);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al guardar"));
    }
  };

  const onEdit = (m) => {
    setEditingId(m.id_doctor);
    setForm({
      nombre: m.nombre || "",
      apellido: m.apellido || "",
      id_especialidad: m.id_especialidad || "",
      matricula: m.matricula || "",
      email: m.email || "",
      telefono: m.telefono || "",
      activo: !!m.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("¿Eliminar este médico?")) return;
    try {
      await medicosAPI.delete(id);
      setSuccess("Médico eliminado");
      const esp = filtroEsp ? Number(filtroEsp) : null;
      fetchData(esp);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al eliminar"));
    }
  };

  const especialidadOptions = useMemo(() => {
    return especialidades
      .slice()
      .sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || ""))
      .map((e) => ({ value: e.id_especialidad, label: e.nombre }));
  }, [especialidades]);

  const especialidadById = useMemo(() => {
    const map = {};
    for (const e of especialidades) {
      map[e.id_especialidad] = e.nombre;
    }
    return map;
  }, [especialidades]);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Médicos</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? "Editar médico" : "Nuevo médico"}</h5>
          {success && <div className="alert alert-success py-2">{success}</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form className="row g-3" onSubmit={onFormSubmit}>
            <div className="col-md-3">
              <label className="form-label">Nombre</label>
              <input type="text" name="nombre" className="form-control" value={form.nombre} onChange={onFormChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Apellido</label>
              <input type="text" name="apellido" className="form-control" value={form.apellido} onChange={onFormChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Especialidad</label>
              <select name="id_especialidad" className="form-select" value={form.id_especialidad} onChange={onFormChange} required>
                <option value="">Seleccioná una especialidad</option>
                {especialidadOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Matrícula</label>
              <input type="text" name="matricula" className="form-control" value={form.matricula} onChange={onFormChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" value={form.email} onChange={onFormChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Teléfono</label>
              <input type="text" name="telefono" className="form-control" value={form.telefono} onChange={onFormChange} />
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <div className="form-check mt-4">
                <input className="form-check-input" type="checkbox" id="med-activo" name="activo" checked={!!form.activo} onChange={onFormChange} />
                <label className="form-check-label" htmlFor="med-activo">Activo</label>
              </div>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" type="submit">{editingId ? "Guardar cambios" : "Crear"}</button>
              <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>Limpiar</button>
            </div>
          </form>
        </div>
      </div>

      <form className="row g-3 mb-3" onSubmit={onFilterSubmit}>
        <div className="col-sm-6">
          <label className="form-label">Filtrar por especialidad</label>
          <select className="form-select" value={filtroEsp} onChange={(e) => setFiltroEsp(e.target.value)}>
            <option value="">Todas</option>
            {especialidadOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-6 d-flex align-items-end gap-2">
          <button type="submit" className="btn btn-outline-primary">Aplicar</button>
          <button type="button" className="btn btn-outline-secondary" onClick={onFilterClear}>Limpiar</button>
        </div>
      </form>

      {loading && <p className="text-muted">Cargando médicos...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Especialidad</th>
              <th>Matrícula</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Activo</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">No hay médicos</td>
              </tr>
            ) : (
              items.map((m) => (
                <tr key={m.id_doctor}>
                  <td>{m.id_doctor}</td>
                  <td>{m.nombre}</td>
                  <td>{m.apellido}</td>
                  <td>{especialidadById[m.id_especialidad] || m.id_especialidad}</td>
                  <td>{m.matricula}</td>
                  <td>{m.email}</td>
                  <td>{m.telefono || '-'}</td>
                  <td>{m.activo ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-outline-light" onClick={() => onEdit(m)}>Editar</button>
                      <button className="btn btn-outline-danger" onClick={() => onDelete(m.id_doctor)}>Eliminar</button>
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

