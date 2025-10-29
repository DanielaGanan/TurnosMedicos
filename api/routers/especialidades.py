from fastapi import APIRouter, status
from typing import List
from schemas import EspecialidadCreate, EspecialidadOut
from services import especialidades

router = APIRouter(prefix="/especialidades", tags=["Especialidades"])


# -------------------------
# LISTAR TODAS
# -------------------------
@router.get("/", response_model=List[EspecialidadOut])
async def listar():
    return await especialidades.listar_especialidades()


# -------------------------
# OBTENER UNA POR ID
# -------------------------
@router.get("/{id_especialidad}", response_model=EspecialidadOut)
async def obtener(id_especialidad: int):
    return await especialidades.obtener_especialidad(id_especialidad)


# -------------------------
# CREAR NUEVA
# -------------------------
@router.post("/", response_model=EspecialidadOut, status_code=status.HTTP_201_CREATED)
async def crear(payload: EspecialidadCreate):
    return await especialidades.crear_especialidad(payload)


# -------------------------
# ACTUALIZAR
# -------------------------
@router.put("/{id_especialidad}", response_model=EspecialidadOut)
async def actualizar(id_especialidad: int, payload: EspecialidadCreate):
    return await especialidades.actualizar_especialidad(id_especialidad, payload)


# -------------------------
# ELIMINAR (SOFT DELETE)
# -------------------------
@router.delete("/{id_especialidad}")
async def eliminar(id_especialidad: int):
    return await especialidades.eliminar_especialidad(id_especialidad)
