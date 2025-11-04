from datetime import datetime
from fastapi import HTTPException
from api.config.database import db
from api.models import medicos


async def _existe_usuario_activo(id_usuario: int):
    q = "SELECT id_usuario, activo FROM usuarios WHERE id_usuario = :id_usuario"
    row = await db.fetch_one(query=q, values={"id_usuario": id_usuario})
    return row and bool(row["activo"]) if row is not None else False


async def _existe_medico_activo(id_doctor: int):
    row = await db.fetch_one(
        medicos.select().where((medicos.c.id_doctor == id_doctor) & (medicos.c.activo == True))
    )
    return row is not None


def _split_datetime(dt: datetime):
    """Divide un datetime en fecha (YYYY-MM-DD) y hora (HH:MM:SS)."""
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt)
        except Exception:
            raise HTTPException(status_code=400, detail="Formato de fecha/hora inválido")
    return dt.date().isoformat(), dt.time().strftime("%H:%M:%S")


async def listar_turnos(id_usuario: int | None = None, id_doctor: int | None = None):
    """Lista turnos activos, mapeando columnas reales a alias esperados por el schema."""
    base = (
        "SELECT id_turno, id_usuario, id_doctor, "
        "CAST(CONCAT(fecha_turno, ' ', hora_turno) AS DATETIME) AS fecha_hora, "
        "motivo_consulta AS motivo, activo "
        "FROM turnos WHERE activo = 1"
    )
    values: dict[str, object] = {}
    if id_usuario:
        base += " AND id_usuario = :id_usuario"
        values["id_usuario"] = id_usuario
    if id_doctor:
        base += " AND id_doctor = :id_doctor"
        values["id_doctor"] = id_doctor
    base += " ORDER BY fecha_turno DESC, hora_turno DESC"
    return await db.fetch_all(query=base, values=values)


async def listar_turnos_detalle(id_usuario: int | None = None, id_doctor: int | None = None):
    """Lista turnos con join a usuarios y doctores, alias compatibles con schemas."""
    base = (
        "SELECT t.id_turno, t.id_usuario, u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, "
        "t.id_doctor, d.nombre AS medico_nombre, d.apellido AS medico_apellido, "
        "CAST(CONCAT(t.fecha_turno, ' ', t.hora_turno) AS DATETIME) AS fecha_hora, "
        "t.motivo_consulta AS motivo, t.activo "
        "FROM turnos t "
        "JOIN usuarios u ON u.id_usuario = t.id_usuario "
        "JOIN doctores d ON d.id_doctor = t.id_doctor "
        "WHERE t.activo = 1"
    )
    values: dict[str, object] = {}
    if id_usuario:
        base += " AND t.id_usuario = :id_usuario"
        values["id_usuario"] = id_usuario
    if id_doctor:
        base += " AND t.id_doctor = :id_doctor"
        values["id_doctor"] = id_doctor
    base += " ORDER BY t.fecha_turno DESC, t.hora_turno DESC"
    return await db.fetch_all(query=base, values=values)


async def obtener_turno(id_turno: int):
    q = (
        "SELECT id_turno, id_usuario, id_doctor, "
        "CAST(CONCAT(fecha_turno, ' ', hora_turno) AS DATETIME) AS fecha_hora, "
        "motivo_consulta AS motivo, activo "
        "FROM turnos WHERE id_turno = :id_turno"
    )
    row = await db.fetch_one(query=q, values={"id_turno": id_turno})
    if not row:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return row


async def crear_turno(payload):
    if not await _existe_usuario_activo(payload.id_usuario):
        raise HTTPException(status_code=400, detail="Usuario inexistente o inactivo")
    if not await _existe_medico_activo(payload.id_doctor):
        raise HTTPException(status_code=400, detail="Médico inexistente o inactivo")

    fecha_turno, hora_turno = _split_datetime(payload.fecha_hora)

    q_dup = (
        "SELECT id_turno FROM turnos "
        "WHERE id_doctor = :id_doctor AND fecha_turno = :fecha_turno "
        "AND hora_turno = :hora_turno AND activo = 1"
    )
    if await db.fetch_one(query=q_dup, values={
        "id_doctor": payload.id_doctor,
        "fecha_turno": fecha_turno,
        "hora_turno": hora_turno,
    }):
        raise HTTPException(status_code=400, detail="El médico ya tiene un turno asignado en ese horario")

    q_insert = (
        "INSERT INTO turnos (id_usuario, id_doctor, fecha_turno, hora_turno, motivo_consulta, activo) "
        "VALUES (:id_usuario, :id_doctor, :fecha_turno, :hora_turno, :motivo_consulta, :activo)"
    )
    new_id = await db.execute(query=q_insert, values={
        "id_usuario": payload.id_usuario,
        "id_doctor": payload.id_doctor,
        "fecha_turno": fecha_turno,
        "hora_turno": hora_turno,
        "motivo_consulta": payload.motivo,
        "activo": 1 if (payload.activo is None or payload.activo) else 0,
    })
    return await obtener_turno(int(new_id))


async def actualizar_turno(id_turno: int, payload):
    existente = await db.fetch_one(
        query="SELECT id_turno, id_usuario, id_doctor, fecha_turno, hora_turno, activo FROM turnos WHERE id_turno = :id_turno",
        values={"id_turno": id_turno},
    )
    if not existente:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    if payload.id_usuario != existente["id_usuario"]:
        if not await _existe_usuario_activo(payload.id_usuario):
            raise HTTPException(status_code=400, detail="Usuario inexistente o inactivo")

    fecha_turno, hora_turno = _split_datetime(payload.fecha_hora)
    if payload.id_doctor != existente["id_doctor"] or fecha_turno != str(existente["fecha_turno"]) or hora_turno != str(existente["hora_turno"]):
        q_dup = (
            "SELECT id_turno FROM turnos WHERE id_doctor = :id_doctor AND fecha_turno = :fecha_turno "
            "AND hora_turno = :hora_turno AND id_turno != :id_turno AND activo = 1"
        )
        if await db.fetch_one(query=q_dup, values={
            "id_doctor": payload.id_doctor,
            "fecha_turno": fecha_turno,
            "hora_turno": hora_turno,
            "id_turno": id_turno,
        }):
            raise HTTPException(status_code=400, detail="El médico ya tiene un turno asignado en ese horario")

    q_update = (
        "UPDATE turnos SET id_usuario = :id_usuario, id_doctor = :id_doctor, "
        "fecha_turno = :fecha_turno, hora_turno = :hora_turno, motivo_consulta = :motivo_consulta, "
        "activo = :activo WHERE id_turno = :id_turno"
    )
    await db.execute(query=q_update, values={
        "id_usuario": payload.id_usuario,
        "id_doctor": payload.id_doctor,
        "fecha_turno": fecha_turno,
        "hora_turno": hora_turno,
        "motivo_consulta": payload.motivo,
        "activo": 1 if (payload.activo is None or payload.activo) else 0,
        "id_turno": id_turno,
    })
    return await obtener_turno(id_turno)


async def eliminar_turno(id_turno: int):
    result = await db.execute(query="UPDATE turnos SET activo = 0 WHERE id_turno = :id_turno", values={"id_turno": id_turno})
    if not result:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return {"message": "Turno cancelado correctamente"}

