from fastapi import HTTPException, status
from api.config.database import db
from api.models import especialidades


# -------------------------
# LISTAR TODAS LAS ESPECIALIDADES
# -------------------------
async def listar_especialidades():
    query = especialidades.select().where(especialidades.c.activo == True)
    return await db.fetch_all(query)


# -------------------------
# OBTENER UNA POR ID
# -------------------------
async def obtener_especialidad(id_especialidad: int):
    row = await db.fetch_one(
        especialidades.select().where(especialidades.c.id_especialidad == id_especialidad)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    return row


# -------------------------
# CREAR NUEVA ESPECIALIDAD (reactiva si existe inactiva)
# -------------------------
async def crear_especialidad(payload):
    try:
        q_exist = especialidades.select().where(especialidades.c.nombre == payload.nombre)
        existente = await db.fetch_one(q_exist)

        if existente:
            # Si ya existe activa, no permitir duplicado
            if existente["activo"]:
                raise HTTPException(status_code=400, detail="Ya existe una especialidad con ese nombre")
            # Si existe inactiva, la reactivamos y actualizamos la descripción
            q_update = (
                especialidades.update()
                .where(especialidades.c.id_especialidad == existente["id_especialidad"])
                .values(
                    nombre=payload.nombre,
                    descripcion=payload.descripcion,
                    activo=True,
                )
            )
            await db.execute(q_update)
            return await db.fetch_one(
                especialidades.select().where(especialidades.c.id_especialidad == existente["id_especialidad"])  # type: ignore
            )

        # No existe: crear normalmente
        q_insert = especialidades.insert().values(
            nombre=payload.nombre,
            descripcion=payload.descripcion,
            activo=payload.activo,
        )
        new_id = await db.execute(q_insert)
        return await db.fetch_one(especialidades.select().where(especialidades.c.id_especialidad == new_id))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear especialidad: {e}")


# -------------------------
# ACTUALIZAR ESPECIALIDAD
# -------------------------
async def actualizar_especialidad(id_especialidad: int, payload):
    especialidad_existente = await db.fetch_one(
        especialidades.select().where(especialidades.c.id_especialidad == id_especialidad)
    )
    if not especialidad_existente:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")

    # Validar nombre unico
    if payload.nombre != especialidad_existente.nombre:
        q_check = especialidades.select().where(especialidades.c.nombre == payload.nombre)
        if await db.fetch_one(q_check):
            raise HTTPException(status_code=400, detail="Ya existe una especialidad con ese nombre")

    q_update = (
        especialidades.update()
        .where(especialidades.c.id_especialidad == id_especialidad)
        .values(
            nombre=payload.nombre,
            descripcion=payload.descripcion,
            activo=payload.activo,
        )
    )
    await db.execute(q_update)
    return await db.fetch_one(especialidades.select().where(especialidades.c.id_especialidad == id_especialidad))


# -------------------------
# ELIMINAR (SOFT DELETE)
# -------------------------
async def eliminar_especialidad(id_especialidad: int):
    q_update = (
        especialidades.update()
        .where(especialidades.c.id_especialidad == id_especialidad)
        .values(activo=False)
    )
    result = await db.execute(q_update)
    if not result:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    return {"message": "Especialidad eliminada correctamente"}

