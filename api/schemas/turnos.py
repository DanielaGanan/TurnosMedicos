from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TurnoBase(BaseModel):
    id_usuario: int
    id_doctor: int
    fecha_hora: datetime
    motivo: Optional[str] = None
    activo: Optional[bool] = True


class TurnoCreate(TurnoBase):
    pass


class TurnoOut(TurnoBase):
    id_turno: int
    
    # Pydantic v2
    model_config = {"from_attributes": True}


class TurnoDetailOut(TurnoOut):
    usuario_nombre: str
    usuario_apellido: str
    medico_nombre: str
    medico_apellido: str
