import { useEffect, useMemo, useState } from "react";
import { turnosAPI } from "../services/turnos.js";
import { medicosAPI, usuariosAPI } from "../services/api.js";

function toInputDateTimeLocal(value) {
  try {
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return "";
  }
}

export default function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [medicos, setMedicos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filters, setFilters] = useState({ id_usuario: "", id_doctor: "" });
  const [form, setForm] = useState({ id_usuario: "", id_doctor: "", fecha_hora: "", motivo: "" });
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

  const fetchTurnos = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await turnosAPI.getAll(opts);
      setTurnos(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al cargar turnos"));
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [u, m] = await Promise.all([
        usuariosAPI.getAll().catch((err) => {
          const detail = err?.response?.data?.detail;
          setError(normalizeDetail(detail || err.message || "Error al cargar usuarios"));
          return [];
        }),
        medicosAPI.getAll().catch((err) => {
          const detail = err?.response?.data?.detail;
          setError(normalizeDetail(detail || err.message || "Error al cargar médicos"));
          return [];
        }),
      ]);
      setUsuarios(Array.isArray(u) ? u : []);
      setMedicos(Array.isArray(m) ? m : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al cargar datos auxiliares"));
    }
  };

  useEffect(() => {
    fetchTurnos();
    fetchAuxData();
  }, []);

  const onFilterSubmit = (e) => {
    e.preventDefault();
    const id_usuario = filters.id_usuario ? Number(filters.id_usuario) : null;
    const id_doctor = filters.id_doctor ? Number(filters.id_doctor) : null;
    fetchTurnos({ id_usuario, id_doctor });
  };

  const onFilterClear = () => {
    setFilters({ id_usuario: "", id_doctor: "" });
    fetchTurnos();
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const clearForm = () => {
    setForm({ id_usuario: "", id_doctor: "", fecha_hora: "", motivo: "" });
    setEditingId(null);
    setSuccess("");
    setError("");
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    const payload = {
      id_usuario: Number(form.id_usuario),
      id_doctor: Number(form.id_doctor),
      fecha_hora: form.fecha_hora,
      motivo: form.motivo || null,
      activo: true,
    };
    try {
      if (!payload.id_usuario || !payload.id_doctor || !payload.fecha_hora) {
        setError("Completá usuario, médico y fecha/hora");
        return;
      }
      if (editingId) {
        await turnosAPI.update(editingId, payload);
        setSuccess("Turno actualizado correctamente");
      } else {
        await turnosAPI.create(payload);
        setSuccess("Turno creado correctamente");
      }
      clearForm();
      fetchTurnos();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al guardar el turno"));
    }
  };

  const onEdit = (t) => {
    setEditingId(t.id_turno);
    setForm({
      id_usuario: t.id_usuario ?? "",
      id_doctor: t.id_doctor ?? "",
      fecha_hora: t.fecha_hora ? toInputDateTimeLocal(t.fecha_hora) : "",
      motivo: t.motivo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("¿Eliminar este turno?")) return;
    try {
      await turnosAPI.delete(id);
      setSuccess("Turno eliminado correctamente");
      fetchTurnos();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(normalizeDetail(detail || err.message || "Error al eliminar turno"));
    }
  };

  const usuariosOptions = useMemo(() => {
    return usuarios
      .slice()
      .sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || ""))
      .map((u) => ({ value: u.id_usuario, label: `${u.nombre} ${u.apellido}` }));
  }, [usuarios]);

  const medicosOptions = useMemo(() => {
    return medicos
      .slice()
      .sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || ""))
      .map((m) => ({ value: m.id_doctor, label: `${m.nombre} ${m.apellido}` }));
  }, [medicos]);

  const usuarioById = useMemo(() => {
    const map = {};
    for (const u of usuarios) {
      map[u.id_usuario] = `${u.nombre} ${u.apellido}`;
    }
    return map;
  }, [usuarios]);

  const medicoById = useMemo(() => {
    const map = {};
    for (const m of medicos) {
      map[m.id_doctor] = `${m.nombre} ${m.apellido}`;
    }
    return map;
  }, [medicos]);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Turnos</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">{editingId ? "Editar turno" : "Nuevo turno"}</h5>

          {success && <div className="alert alert-success py-2">{success}</div>}
          {error && <div className="alert alert-danger py-2">{String(error)}</div>}

          <form className="row g-3" onSubmit={onFormSubmit}>
            <div className="col-md-4">
              <label className="form-label">Usuario</label>
              <select
                name="id_usuario"
                className="form-select"
                value={form.id_usuario}
                onChange={onFormChange}
                required
              >
                <option value="">Seleccioná un usuario</option>
                {usuariosOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Médico</label>
              <select
                name="id_doctor"
                className="form-select"
                value={form.id_doctor}
                onChange={onFormChange}
                required
              >
                <option value="">Seleccioná un médico</option>
                {medicosOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Fecha y hora</label>
              <input
                type="datetime-local"
                name="fecha_hora"
                className="form-control"
                value={form.fecha_hora}
                onChange={onFormChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Motivo (opcional)</label>
              <input
                type="text"
                name="motivo"
                className="form-control"
                placeholder="Motivo de la consulta"
                value={form.motivo}
                onChange={onFormChange}
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Guardar cambios" : "Crear turno"}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={clearForm}>
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <form className="row g-3 mb-3" onSubmit={onFilterSubmit}>
        <div className="col-sm-4">
          <label className="form-label">ID Usuario</label>
          <input
            type="number"
            className="form-control"
            value={filters.id_usuario}
            onChange={(e) => setFilters((f) => ({ ...f, id_usuario: e.target.value }))}
            placeholder="Ej: 1"
            min="1"
          />
        </div>
        <div className="col-sm-4">
          <label className="form-label">ID Médico</label>
          <input
            type="number"
            className="form-control"
            value={filters.id_doctor}
            onChange={(e) => setFilters((f) => ({ ...f, id_doctor: e.target.value }))}
            placeholder="Ej: 3"
            min="1"
          />
        </div>
        <div className="col-sm-4 d-flex align-items-end gap-2">
          <button type="submit" className="btn btn-outline-primary">Buscar</button>
          <button type="button" className="btn btn-outline-secondary" onClick={onFilterClear}>Limpiar</button>
        </div>
      </form>

      {loading && <p className="text-muted">Cargando turnos...</p>}
      {error && <p className="text-danger">{String(error)}</p>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Médico</th>
                <th>Fecha y Hora</th>
                <th>Motivo</th>
                <th>Activo</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No hay turnos para mostrar.</td>
                </tr>
              ) : (
                turnos.map((t, idx) => (
                  <tr key={t.id_turno ?? idx}>
                    <td>{t.id_turno ?? '-'}</td>
                    <td>{usuarioById[t.id_usuario] || t.id_usuario || '-'}</td>
                    <td>{medicoById[t.id_doctor] || t.id_doctor || '-'}</td>
                    <td>{t.fecha_hora ? new Date(t.fecha_hora).toLocaleString() : '-'}</td>
                    <td>{t.motivo ?? '-'}</td>
                    <td>{typeof t.activo === 'boolean' ? (t.activo ? 'Sí' : 'No') : '-'}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button type="button" className="btn btn-outline-light" onClick={() => onEdit(t)}>
                          Editar
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => onDelete(t.id_turno)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

