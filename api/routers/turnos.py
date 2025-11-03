from fastapi import APIRouter, status
from typing import List
from api.schemas.turnos import TurnoCreate, TurnoOut, TurnoDetailOut
from api.services import turnos as service


router = APIRouter(prefix="/turnos", tags=["Turnos"])


@router.get("/", response_model=List[TurnoOut])
async def listar(id_usuario: int | None = None, id_doctor: int | None = None):
    return await service.listar_turnos(id_usuario, id_doctor)


@router.get("/{id_turno}", response_model=TurnoOut)
async def obtener(id_turno: int):
    return await service.obtener_turno(id_turno)


@router.get("/detalle", response_model=List[TurnoDetailOut])
async def listar_detalle(id_usuario: int | None = None, id_doctor: int | None = None):
    return await service.listar_turnos_detalle(id_usuario, id_doctor)


@router.post("/", response_model=TurnoOut, status_code=status.HTTP_201_CREATED)
async def crear(payload: TurnoCreate):
    return await service.crear_turno(payload)


@router.put("/{id_turno}", response_model=TurnoOut)
async def actualizar(id_turno: int, payload: TurnoCreate):
    return await service.actualizar_turno(id_turno, payload)


@router.delete("/{id_turno}")
async def eliminar(id_turno: int):
    return await service.eliminar_turno(id_turno)
