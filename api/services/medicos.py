from fastapi import HTTPException, status
from api.config.database import db
from api.models import medicos, especialidades
from sqlalchemy import select


# -------------------------
# LISTAR MÃ‰DICOS
# -------------------------
async def listar_medicos(id_especialidad: int | None = None):
    query = medicos.select().where(medicos.c.activo == True)
    if id_especialidad:
        query = query.where(medicos.c.id_especialidad == id_especialidad)
    return await db.fetch_all(query)


# -------------------------
# LISTAR MÃ‰DICOS CON ESPECIALIDAD (DETALLE)
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
# OBTENER MÃ‰DICO POR ID
# -------------------------
async def obtener_medico(id_doctor: int):
    row = await db.fetch_one(medicos.select().where(medicos.c.id_doctor == id_doctor))
    if not row:
        raise HTTPException(status_code=404, detail="MÃ©dico no encontrado")
    return row


# -------------------------
# CREAR MÃ‰DICO
# -------------------------
async def crear_medico(payload):
    # Validar existencia de la especialidad
    q_esp = especialidades.select().where(especialidades.c.id_especialidad == payload.id_especialidad)
    esp = await db.fetch_one(q_esp)
    if not esp:
        raise HTTPException(status_code=400, detail="La especialidad indicada no existe")

    # Buscar por email o matrícula (incluye activos e inactivos)
    existente_email = await db.fetch_one(medicos.select().where(medicos.c.email == payload.email))
    existente_mat = await db.fetch_one(medicos.select().where(medicos.c.matricula == payload.matricula))

    # Si existe activo con mismo email o matrícula -> error
    if existente_email and existente_email["activo"]:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    if existente_mat and existente_mat["activo"]:
        raise HTTPException(status_code=400, detail="Matrícula ya registrada")

    # Reactivar si existe inactivo
    objetivo = None
    if existente_email and not existente_email["activo"]:
        objetivo = existente_email
        if existente_mat and existente_mat["id_doctor"] != existente_email["id_doctor"] and existente_mat["activo"]:
            raise HTTPException(status_code=400, detail="Matrícula ya registrada por otro médico")
    elif existente_mat and not existente_mat["activo"]:
        objetivo = existente_mat
        if existente_email and existente_email["id_doctor"] != existente_mat["id_doctor"] and existente_email["activo"]:
            raise HTTPException(status_code=400, detail="Email ya registrado por otro médico")

    if objetivo:
        q_update = (
            medicos.update()
            .where(medicos.c.id_doctor == objetivo["id_doctor"])  # type: ignore
            .values(
                nombre=payload.nombre,
                apellido=payload.apellido,
                id_especialidad=payload.id_especialidad,
                matricula=payload.matricula,
                email=payload.email,
                telefono=payload.telefono,
                activo=True,
            )
        )
        await db.execute(q_update)
        return await db.fetch_one(medicos.select().where(medicos.c.id_doctor == objetivo["id_doctor"]))

    # Crear nuevo
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
    return await db.fetch_one(medicos.select().where(medicos.c.id_doctor == new_id))# -------------------------
# ACTUALIZAR MÃ‰DICO
# -------------------------
async def actualizar_medico(id_doctor: int, payload):
    medico_existente = await db.fetch_one(medicos.select().where(medicos.c.id_doctor == id_doctor))
    if not medico_existente:
        raise HTTPException(status_code=404, detail="Medico no encontrado")

    # Validar especialidad
    q_esp = especialidades.select().where(especialidades.c.id_especialidad == payload.id_especialidad)
    if not await db.fetch_one(q_esp):
        raise HTTPException(status_code=400, detail="La especialidad indicada no existe")

    # Validar email (si cambia)
    if payload.email != medico_existente.email:
        q_email = medicos.select().where(medicos.c.email == payload.email)
        row_email = await db.fetch_one(q_email)
        if row_email and row_email["id_doctor"] != id_doctor:
            if row_email["activo"]:
                raise HTTPException(status_code=400, detail="Email ya registrado")
            else:
                raise HTTPException(status_code=400, detail="Email asociado a un medico inactivo. Reactivelo o use otro email")

    # Validar matricula (si cambia)
    if payload.matricula != medico_existente.matricula:
        q_mat = medicos.select().where(medicos.c.matricula == payload.matricula)
        row_mat = await db.fetch_one(q_mat)
        if row_mat and row_mat["id_doctor"] != id_doctor:
            if row_mat["activo"]:
                raise HTTPException(status_code=400, detail="Matricula ya registrada")
            else:
                raise HTTPException(status_code=400, detail="Matricula asociada a un medico inactivo. Reactivelo o use otra matricula")

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
        raise HTTPException(status_code=404, detail="MÃ©dico no encontrado")
    return {"message": "MÃ©dico eliminado correctamente"}
