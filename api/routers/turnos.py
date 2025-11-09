from fastapi import APIRouter, Query
from datetime import date
from api.services import turnos
from api.schemas.turnos import TurnoCreate, TurnoOut, TurnoDetailOut

router = APIRouter(
   # prefix="/turnos",
    tags=["Turnos"]
)


# ============================================================
# ENDPOINTS PRINCIPALES (CON STORED PROCEDURES)
# ============================================================

@router.get("/{id_doctor}/disponibilidad", response_model=list[str])
async def obtener_disponibilidad(
    id_doctor: int,
    fecha: date = Query(..., description="Fecha a consultar (YYYY-MM-DD)")
):
    """
    Obtiene los horarios disponibles para un doctor en una fecha específica.
    """
    return await turnos.obtener_disponibilidad(id_doctor=id_doctor, fecha=fecha)



@router.post("/reservar", response_model=TurnoOut)
async def reservar_turno(turno: TurnoCreate):
    """
    Reserva un turno (usa Stored Procedure)
    
    Body:
    {
        "id_usuario": 1,
        "id_doctor": 3,
        "fecha_hora": "2025-11-10T10:00:00",
        "motivo": "Control de rutina"
    }
    """
    return await turnos.crear_turno_sp(turno)


@router.delete("/{id_turno}/cancelar")
async def cancelar_turno(
    id_turno: int,
    id_usuario: int = Query(..., description="ID del usuario")
): 
    """Cancela un turno"""



@router.get("/detalle", response_model=list[TurnoDetailOut])
async def listar_turnos_detalle(
    id_usuario: int | None = Query(None, description="Filtra por ID de usuario"),
    id_doctor: int | None = Query(None, description="Filtra por ID de doctor")
):
    """
    Lista los turnos con detalle de usuario y médico.

    Ejemplos:
    - GET /turnos/detalle
    - GET /turnos/detalle?id_usuario=1
    - GET /turnos/detalle?id_doctor=2
    """
    return await turnos.listar_turnos_detalle(id_usuario=id_usuario, id_doctor=id_doctor)