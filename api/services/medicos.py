from fastapi import HTTPException, status
from api.config.database import db
from api.models import medicos, especialidades
from sqlalchemy import select


# -------------------------
# LISTAR MÉDICOS
# -------------------------
async def listar_medicos(id_especialidad: int | None = None):
    query = medicos.select().where(medicos.c.activo == True)
    if id_especialidad:
        query = query.where(medicos.c.id_especialidad == id_especialidad)
    return await db.fetch_all(query)


# -------------------------
# LISTAR MÉDICOS CON ESPECIALIDAD (DETALLE)
# -------------------------
async def listar_medicos_detalle(id_especialidad: int | None = None):
    stmt = (
        select(
            medicos.c.id_doctor,
            medicos.c.nombre,
            medicos.c.apellido,
            medicos.c.id_especialidad,
            medicos.c.matricula,
            medicos.c.email,
            medicos.c.telefono,
            medicos.c.activo,
            especialidades.c.nombre.label("especialidad_nombre"),
        )
        .select_from(medicos.join(especialidades, medicos.c.id_especialidad == especialidades.c.id_especialidad))
        .where(medicos.c.activo == True)
    )
    if id_especialidad:
        stmt = stmt.where(medicos.c.id_especialidad == id_especialidad)
    return await db.fetch_all(stmt)


# -------------------------
# OBTENER MÉDICO POR ID
# -------------------------
async def obtener_medico(id_doctor: int):
    row = await db.fetch_one(medicos.select().where(medicos.c.id_doctor == id_doctor))
    if not row:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    return row


# -------------------------
# CREAR MÉDICO
# -------------------------
async def crear_medico(payload):
    # Validar existencia de la especialidad
    q_esp = especialidades.select().where(especialidades.c.id_especialidad == payload.id_especialidad)
    esp = await db.fetch_one(q_esp)
    if not esp:
        raise HTTPException(status_code=400, detail="La especialidad indicada no existe")

    # Validar email único
    q_email = medicos.select().where(medicos.c.email == payload.email)
    if await db.fetch_one(q_email):
        raise HTTPException(status_code=400, detail="Email ya registrado")

    # Validar matrícula única
    q_mat = medicos.select().where(medicos.c.matricula == payload.matricula)
    if await db.fetch_one(q_mat):
        raise HTTPException(status_code=400, detail="Matrícula ya registrada")

    q_insert = medicos.insert().values(
        nombre=payload.nombre,
        apellido=payload.apellido,
        id_especialidad=payload.id_especialidad,
        matricula=payload.matricula,
        email=payload.email,
        telefono=payload.telefono,
        activo=payload.activo
    )
    new_id = await db.execute(q_insert)
    return await db.fetch_one(medicos.select().where(medicos.c.id_doctor == new_id))


# -------------------------
# ACTUALIZAR MÉDICO
# -------------------------
async def actualizar_medico(id_doctor: int, payload):
    medico_existente = await db.fetch_one(medicos.select().where(medicos.c.id_doctor == id_doctor))
    if not medico_existente:
        raise HTTPException(status_code=404, detail="Médico no encontrado")

    # Validar especialidad
    q_esp = especialidades.select().where(especialidades.c.id_especialidad == payload.id_especialidad)
    if not await db.fetch_one(q_esp):
        raise HTTPException(status_code=400, detail="La especialidad indicada no existe")

    # Validar email único (si cambia)
    if payload.email != medico_existente.email:
        q_email = medicos.select().where(medicos.c.email == payload.email)
        if await db.fetch_one(q_email):
            raise HTTPException(status_code=400, detail="Email ya registrado")

    # Validar matrícula única (si cambia)
    if payload.matricula != medico_existente.matricula:
        q_mat = medicos.select().where(medicos.c.matricula == payload.matricula)
        if await db.fetch_one(q_mat):
            raise HTTPException(status_code=400, detail="Matrícula ya registrada")

    q_update = (
        medicos.update()
        .where(medicos.c.id_doctor == id_doctor)
        .values(
            nombre=payload.nombre,
            apellido=payload.apellido,
            id_especialidad=payload.id_especialidad,
            matricula=payload.matricula,
            email=payload.email,
            telefono=payload.telefono,
            activo=payload.activo,
        )
    )
    await db.execute(q_update)
    return await db.fetch_one(medicos.select().where(medicos.c.id_doctor == id_doctor))


# -------------------------
# ELIMINAR (SOFT DELETE)
# -------------------------
async def eliminar_medico(id_doctor: int):
    q_update = medicos.update().where(medicos.c.id_doctor == id_doctor).values(activo=False)
    result = await db.execute(q_update)
    if not result:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    return {"message": "Médico eliminado correctamente"}
