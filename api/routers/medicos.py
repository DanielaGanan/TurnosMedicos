from fastapi import APIRouter, status
from typing import List
from schemas.medicos import MedicoCreate, MedicoOut
from services import medicos

router = APIRouter(prefix="/medicos", tags=["Médicos"])


# -------------------------
# LISTAR MÉDICOS
# -------------------------
@router.get("/", response_model=List[MedicoOut])
async def listar(id_especialidad: int | None = None):
    return await medicos.listar_medicos(id_especialidad)


# -------------------------
# OBTENER UNO POR ID
# -------------------------
@router.get("/{id_doctor}", response_model=MedicoOut)
async def obtener(id_doctor: int):
    return await medicos.obtener_medico(id_doctor)


# -------------------------
# CREAR NUEVO
# -------------------------
@router.post("/", response_model=MedicoOut, status_code=status.HTTP_201_CREATED)
async def crear(payload: MedicoCreate):
    return await medicos.crear_medico(payload)


# -------------------------
# ACTUALIZAR EXISTENTE
# -------------------------
@router.put("/{id_doctor}", response_model=MedicoOut)
async def actualizar(id_doctor: int, payload: MedicoCreate):
    return await medicos.actualizar_medico(id_doctor, payload)


# -------------------------
# ELIMINAR (SOFT DELETE)
# -------------------------
@router.delete("/{id_doctor}")
async def eliminar(id_doctor: int):
    return await medicos.eliminar_medico(id_doctor)
