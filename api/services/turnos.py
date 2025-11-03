from fastapi import HTTPException
from api.config.database import db
from api.models import turnos, medicos


async def _existe_usuario_activo(id_usuario: int):
    q = "SELECT id_usuario, activo FROM usuarios WHERE id_usuario = :id_usuario"
    row = await db.fetch_one(query=q, values={"id_usuario": id_usuario})
    return row and bool(row["activo"]) if row is not None else False


async def _existe_medico_activo(id_doctor: int):
    row = await db.fetch_one(
        medicos.select().where((medicos.c.id_doctor == id_doctor) & (medicos.c.activo == True))
    )
    return row is not None


# Listar turnos (con filtros opcionales)
async def listar_turnos(id_usuario: int | None = None, id_doctor: int | None = None):
    q = turnos.select().where(turnos.c.activo == True)
    if id_usuario:
        q = q.where(turnos.c.id_usuario == id_usuario)
    if id_doctor:
        q = q.where(turnos.c.id_doctor == id_doctor)
    return await db.fetch_all(q)


# -------------------------
# LISTAR TURNOS DETALLE (JOIN con usuarios y doctores)
# -------------------------
async def listar_turnos_detalle(id_usuario: int | None = None, id_doctor: int | None = None):
    base = (
        "SELECT t.id_turno, t.id_usuario, u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, "
        "t.id_doctor, d.nombre AS medico_nombre, d.apellido AS medico_apellido, "
        "t.fecha_hora, t.motivo, t.activo "
        "FROM turnos t "
        "JOIN usuarios u ON u.id_usuario = t.id_usuario "
        "JOIN doctores d ON d.id_doctor = t.id_doctor "
        "WHERE t.activo = 1"
    )
    values = {}
    if id_usuario:
        base += " AND t.id_usuario = :id_usuario"
        values["id_usuario"] = id_usuario
    if id_doctor:
        base += " AND t.id_doctor = :id_doctor"
        values["id_doctor"] = id_doctor
    base += " ORDER BY t.fecha_hora DESC"
    return await db.fetch_all(query=base, values=values)


# Obtener un turno por ID
async def obtener_turno(id_turno: int):
    row = await db.fetch_one(turnos.select().where(turnos.c.id_turno == id_turno))
    if not row:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return row


# Crear turno
async def crear_turno(payload):
    # Validaciones de existencia y estado
    if not await _existe_usuario_activo(payload.id_usuario):
        raise HTTPException(status_code=400, detail="Usuario inexistente o inactivo")
    if not await _existe_medico_activo(payload.id_doctor):
        raise HTTPException(status_code=400, detail="Médico inexistente o inactivo")

    # Evitar solapado del mismo médico en la misma fecha/hora
    q_dup = turnos.select().where(
        (turnos.c.id_doctor == payload.id_doctor)
        & (turnos.c.fecha_hora == payload.fecha_hora)
        & (turnos.c.activo == True)
    )
    if await db.fetch_one(q_dup):
        raise HTTPException(status_code=400, detail="El médico ya tiene un turno asignado en ese horario")

    q_insert = turnos.insert().values(
        id_usuario=payload.id_usuario,
        id_doctor=payload.id_doctor,
        fecha_hora=payload.fecha_hora,
        motivo=payload.motivo,
        activo=payload.activo,
    )
    new_id = await db.execute(q_insert)
    return await db.fetch_one(turnos.select().where(turnos.c.id_turno == new_id))


# Actualizar turno
async def actualizar_turno(id_turno: int, payload):
    existente = await db.fetch_one(turnos.select().where(turnos.c.id_turno == id_turno))
    if not existente:
        raise HTTPException(status_code=404, detail="Turno no encontrado")

    # Validaciones (si cambian referencias u horario)
    if payload.id_usuario != existente["id_usuario"]:
        if not await _existe_usuario_activo(payload.id_usuario):
            raise HTTPException(status_code=400, detail="Usuario inexistente o inactivo")
    if payload.id_doctor != existente["id_doctor"] or payload.fecha_hora != existente["fecha_hora"]:
        # Evitar solapado
        q_dup = turnos.select().where(
            (turnos.c.id_doctor == payload.id_doctor)
            & (turnos.c.fecha_hora == payload.fecha_hora)
            & (turnos.c.id_turno != id_turno)
            & (turnos.c.activo == True)
        )
        if await db.fetch_one(q_dup):
            raise HTTPException(status_code=400, detail="El médico ya tiene un turno asignado en ese horario")

    q_update = (
        turnos.update()
        .where(turnos.c.id_turno == id_turno)
        .values(
            id_usuario=payload.id_usuario,
            id_doctor=payload.id_doctor,
            fecha_hora=payload.fecha_hora,
            motivo=payload.motivo,
            activo=payload.activo,
        )
    )
    await db.execute(q_update)
    return await db.fetch_one(turnos.select().where(turnos.c.id_turno == id_turno))


# Eliminar (soft delete)
async def eliminar_turno(id_turno: int):
    q = turnos.update().where(turnos.c.id_turno == id_turno).values(activo=False)
    result = await db.execute(q)
    if not result:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return {"message": "Turno cancelado correctamente"}
