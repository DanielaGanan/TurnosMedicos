from fastapi import APIRouter, HTTPException, status
from typing import List
from config.database import db
from models import especialidades, medicos
from schemas import (
    EspecialidadCreate, EspecialidadOut,
    MedicoCreate, MedicoOut
)

router = APIRouter(prefix="/api", tags=["Especialidades y Medicos"])


# -----------------------
# ESPECIALIDADES
# -----------------------
@router.get("/especialidades", response_model=List[EspecialidadOut])
async def listar_especialidades():
    query = especialidades.select().where(especialidades.c.activo == True)
    rows = await db.fetch_all(query)
    return [ { **dict(row) } for row in rows ]


@router.post("/especialidades", response_model=EspecialidadOut, status_code=status.HTTP_201_CREATED)
async def crear_especialidad(payload: EspecialidadCreate):
    # chequeo simple: nombre único
    q_check = especialidades.select().where(especialidades.c.nombre == payload.nombre)
    existe = await db.fetch_one(q_check)
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una especialidad con ese nombre")

    q = especialidades.insert().values(
        nombre=payload.nombre,
        descripcion=payload.descripcion,
        activo=payload.activo
    )
    new_id = await db.execute(q)
    # devolver la fila creada
    row = await db.fetch_one(especialidades.select().where(especialidades.c.id_especialidad == new_id))
    return { **dict(row) }


# -----------------------
# MEDICOS
# -----------------------
@router.get("/medicos", response_model=List[MedicoOut])
async def listar_medicos():
    query = medicos.select().where(medicos.c.activo == True)
    rows = await db.fetch_all(query)
    return [ { **dict(row) } for row in rows ]


@router.post("/medicos", response_model=MedicoOut, status_code=status.HTTP_201_CREATED)
async def crear_medico(payload: MedicoCreate):
    # validar que exista la especialidad
    q_esp = especialidades.select().where(especialidades.c.id_especialidad == payload.id_especialidad)
    esp = await db.fetch_one(q_esp)
    if not esp:
        raise HTTPException(status_code=400, detail="Especialidad no existe")

    # verificar email o matricula únicos
    q_email = medicos.select().where(medicos.c.email == payload.email)
    if await db.fetch_one(q_email):
        raise HTTPException(status_code=400, detail="Email de médico ya registrado")

    q = medicos.insert().values(
        nombre=payload.nombre,
        apellido=payload.apellido,
        id_especialidad=payload.id_especialidad,
        matricula=payload.matricula,
        email=payload.email,
        telefono=payload.telefono,
        activo=payload.activo
    )
    new_id = await db.execute(q)
    row = await db.fetch_one(medicos.select().where(medicos.c.id_doctor == new_id))
    return { **dict(row) }
