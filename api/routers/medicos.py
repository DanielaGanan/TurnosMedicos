from fastapi import APIRouter, HTTPException, status
from typing import List
from config.database import db
from models import medicos, especialidades
from schemas import MedicoCreate, MedicoOut

router = APIRouter(prefix="/medicos", tags=["Médicos"])

@router.get("/", response_model=List[MedicoOut])
async def listar_medicos():
    query = medicos.select().where(medicos.c.activo == True)
    rows = await db.fetch_all(query)
    return [dict(row) for row in rows]

@router.post("/", response_model=MedicoOut, status_code=status.HTTP_201_CREATED)
async def crear_medico(payload: MedicoCreate):
    q_esp = especialidades.select().where(especialidades.c.id_especialidad == payload.id_especialidad)
    esp = await db.fetch_one(q_esp)
    if not esp:
        raise HTTPException(status_code=400, detail="Especialidad no existe")

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
    return dict(row)
