from fastapi import APIRouter, HTTPException, status
from typing import List
from config.database import db
from models import especialidades
from schemas import EspecialidadCreate, EspecialidadOut

router = APIRouter(prefix="/especialidades", tags=["Especialidades"])

@router.get("/", response_model=List[EspecialidadOut])
async def listar_especialidades():
    query = especialidades.select().where(especialidades.c.activo == True)
    rows = await db.fetch_all(query)
    return [dict(row) for row in rows]

@router.post("/", response_model=EspecialidadOut, status_code=status.HTTP_201_CREATED)
async def crear_especialidad(payload: EspecialidadCreate):
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
    row = await db.fetch_one(especialidades.select().where(especialidades.c.id_especialidad == new_id))
    return dict(row)
