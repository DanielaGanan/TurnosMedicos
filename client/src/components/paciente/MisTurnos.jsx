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

  // ESTADO DEL FORMULARIO: Separamos fecha y hora
  const [form, setForm] = useState({
    id_doctor: "",
    fecha: "",
    hora: "",
    motivo: "",
  });
  const [horariosDisponibles, setHorariosDisponibles] = useState([]); // Horarios devueltos por la API
  const [disponibilidadLoading, setDisponibilidadLoading] = useState(false); // Estado de carga de disponibilidad

  const normalizeDetail = (detail) => {
    if (!detail) return "";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const parts = detail.map((e) => (e && e.msg ? e.msg : String(e)));
      return parts.join("; ");
    }
    if (typeof detail === "object") return detail.msg || JSON.stringify(detail);
    try {
      return String(detail);
    } catch {
      return "";
    }
  };

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
      const data = await turnosAPI.getAllDetail({ id_usuario: idUsuario });
      setTurnos(Array.isArray(data) ? data : []);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        normalizeDetail(detail || err.message || "Error al cargar turnos")
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMedicos = async () => {
    try {
      const data = await medicosAPI.getAll();
      setMedicos(Array.isArray(data) ? data : []);
    } catch (err) {
      setMedicos([]);
      const detail = err?.response?.data?.detail;
      setError(
        normalizeDetail(detail || err.message || "Error al cargar médicos")
      );
    }
  };

  // EFECTO para cargar médicos
  useEffect(() => {
    loadMedicos();
  }, []);

  // EFECTO para cargar los turnos del usuario
  useEffect(() => {
    loadData();
  }, [idUsuario]);

  // =======================================================================
  // NUEVO EFECTO: Cargar disponibilidad cuando cambian médico o fecha
  // =======================================================================
  useEffect(() => {
    const { id_doctor, fecha } = form;

    if (id_doctor && fecha) {
      setDisponibilidadLoading(true);
      setError("");
      setHorariosDisponibles([]);

      turnosAPI
        .getDisponibilidad(Number(id_doctor), fecha)
        .then((data) => {
          setHorariosDisponibles(data);
        })
        .catch((err) => {
          const detail = err?.response?.data?.detail;
          const errorMsg = normalizeDetail(
            detail || err.message || "Error al cargar disponibilidad"
          );
          setError(errorMsg);
          setHorariosDisponibles([]); // Limpia si hay error (ej: fin de semana)
        })
        .finally(() => {
          setDisponibilidadLoading(false);
        });
    } else {
      setHorariosDisponibles([]); // Limpia si falta médico o fecha
    }
  }, [form.id_doctor, form.fecha]);

  // =======================================================================
  // HANDLERS
  // =======================================================================

  // onFormChange: Se modifica para manejar los campos separados
  const onFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      // Si la fecha cambia, resetea la hora para forzar la recarga de disponibilidad
      setForm((f) => ({ ...f, fecha: value, hora: "" }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // clearForm: Se modifica para limpiar los nuevos campos
  const clearForm = () =>
    setForm({ id_doctor: "", fecha: "", hora: "", motivo: "" });

  // onCreate: Se modifica para unir fecha y hora en el payload
  const onCreate = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!idUsuario) return;

    // Validar que los tres campos estén llenos
    if (!form.id_doctor || !form.fecha || !form.hora) {
      setError("Seleccioná médico, fecha y hora");
      return;
    }

    // Construcción del payload, uniendo fecha y hora
    const payload = {
      id_usuario: idUsuario,
      id_doctor: Number(form.id_doctor),
      // Formato esperado por FastAPI: YYYY-MM-DDT HH:MM:SS
      fecha_hora: `${form.fecha}T${form.hora}`,
      motivo: form.motivo || null,
      activo: true,
    };

    try {
      await turnosAPI.create(payload);
      setSuccess("Turno reservado correctamente");
      clearForm();
      loadData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        normalizeDetail(detail || err.message || "Error al reservar turno")
      );
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
      setError(
        normalizeDetail(detail || err.message || "Error al cancelar turno")
      );
    }
  };

  // =======================================================================
  // RENDERIZADO
  // =======================================================================
  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Mis Turnos</h2>

      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Reservar nuevo turno</h5>
          <form className="row g-3" onSubmit={onCreate}>
            {/* 1. Selección de Médico */}
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
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Selección de Fecha */}
            <div className="col-md-2">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                name="fecha"
                className="form-control"
                value={form.fecha}
                onChange={onFormChange}
                required
                min={new Date().toISOString().split("T")[0]} // Opcional: solo fechas futuras
              />
            </div>

            {/* 3. Selección de Hora (Horarios Limitados) */}
            <div className="col-md-2">
              <label className="form-label">Hora</label>
              <select
                className="form-select"
                name="hora"
                value={form.hora}
                onChange={onFormChange}
                // Deshabilitado si falta médico/fecha o está cargando
                disabled={
                  !form.id_doctor || !form.fecha || disponibilidadLoading
                }
                required
              >
                <option value="">
                  {disponibilidadLoading
                    ? "Cargando..."
                    : !form.id_doctor || !form.fecha
                    ? "Seleccioná fecha"
                    : horariosDisponibles.length === 0
                    ? "No hay disponibilidad"
                    : "Seleccioná hora"}
                </option>
                {horariosDisponibles.map((h) => (
                  // Muestra solo HH:MM
                  <option key={h} value={h}>
                    {h.substring(0, 5)}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Motivo */}
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

            {/* Botón de Reserva */}
            <div className="col-12">
              <button className="btn btn-primary" type="submit">
                Reservar
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && <p className="text-muted">Cargando turnos...</p>}

      {/* ... Resto del componente de tabla sin cambios ... */}
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
                <td colSpan="6" className="text-center text-muted">
                  No tenés turnos reservados
                </td>
              </tr>
            ) : (
              turnos.map((t) => (
                <tr key={t.id_turno}>
                  <td>{t.id_turno}</td>
                  <td>
                    {`${t.medico_nombre ?? ""} ${
                      t.medico_apellido ?? ""
                    }`.trim()}
                  </td>
                  <td>
                    {t.fecha_hora
                      ? new Date(t.fecha_hora).toLocaleString()
                      : "-"}
                  </td>
                  <td>{t.motivo ?? "-"}</td>
                  <td>{t.activo ? "Activo" : "Cancelado"}</td>
                  <td>
                    {t.activo && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onCancel(t.id_turno)}
                      >
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
