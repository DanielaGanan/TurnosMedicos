import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { turnosAPI } from "../../services/turnos.js";
import { medicosAPI } from "../../services/api.js";

export default function MisTurnos() {
  const { user } = useAuth();
  const idUsuario = user?.id_usuario;

  const [turnos, setTurnos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ id_doctor: "", fecha_hora: "", motivo: "" });

  const medicosOptions = useMemo(() => {
    return medicos
      .slice()
      .sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || ""))
      .map((m) => ({ value: m.id_doctor, label: `${m.nombre} ${m.apellido}` }));
  }, [medicos]);

  const loadData = async () => {
    if (!idUsuario) return;
    setLoading(true);
    setError("");
    try {
      // Usamos endpoint de detalle para mostrar nombres
      const data = await turnosAPI.getAllDetail({ id_usuario: idUsuario });
      setTurnos(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || err.message || "Error al cargar turnos");
    } finally {
      setLoading(false);
    }
  };

  const loadMedicos = async () => {
    try {
      const data = await medicosAPI.getAll();
      setMedicos(Array.isArray(data) ? data : []);
    } catch {
      setMedicos([]);
    }
  };

  useEffect(() => {
    loadMedicos();
  }, []);

  useEffect(() => {
    loadData();
  }, [idUsuario]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const clearForm = () => setForm({ id_doctor: "", fecha_hora: "", motivo: "" });

  const onCreate = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!idUsuario) return;
    const payload = {
      id_usuario: idUsuario,
      id_doctor: Number(form.id_doctor),
      fecha_hora: form.fecha_hora,
      motivo: form.motivo || null,
      activo: true,
    };
    if (!payload.id_doctor || !payload.fecha_hora) {
      setError("Seleccioná médico y fecha/hora");
      return;
    }
    try {
      await turnosAPI.create(payload);
      setSuccess("Turno reservado correctamente");
      clearForm();
      loadData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || err.message || "Error al reservar turno");
    }
  };

  const onCancel = async (id_turno) => {
    if (!id_turno) return;
    if (!window.confirm("¿Cancelar este turno?")) return;
    try {
      await turnosAPI.delete(id_turno);
      setSuccess("Turno cancelado");
      loadData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || err.message || "Error al cancelar turno");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Mis Turnos</h2>

      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Reservar nuevo turno</h5>
          <form className="row g-3" onSubmit={onCreate}>
            <div className="col-md-4">
              <label className="form-label">Médico</label>
              <select
                className="form-select"
                name="id_doctor"
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
            <div className="col-md-4">
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
            <div className="col-12">
              <button className="btn btn-primary" type="submit">Reservar</button>
            </div>
          </form>
        </div>
      </div>

      {loading && <p className="text-muted">Cargando turnos...</p>}

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Médico</th>
              <th>Fecha</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">No tenés turnos reservados</td>
              </tr>
            ) : (
              turnos.map((t) => (
                <tr key={t.id_turno}>
                  <td>{t.id_turno}</td>
                  <td>{`${t.medico_nombre ?? ''} ${t.medico_apellido ?? ''}`.trim()}</td>
                  <td>{t.fecha_hora ? new Date(t.fecha_hora).toLocaleString() : '-'}</td>
                  <td>{t.motivo ?? '-'}</td>
                  <td>{t.activo ? 'Activo' : 'Cancelado'}</td>
                  <td>
                    {t.activo && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onCancel(t.id_turno)}>
                        Cancelar
                      </button>
                    )}
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
