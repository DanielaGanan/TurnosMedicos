from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TurnoCreate(BaseModel):
    """Para crear un turno (input)"""
    id_usuario: int
    id_doctor: int
    fecha_hora: datetime
    motivo: str


class TurnoOut(BaseModel):
    """Para respuesta de turnos (output)"""
    id_turno: int
    id_usuario: int
    id_doctor: int
    fecha_hora: datetime
    motivo: str
    activo: bool
    
    model_config = {"from_attributes": True}


class TurnoDetailOut(TurnoOut):
    """Para RESPUESTAS con datos de usuario y doctor"""
    usuario_nombre: str
    usuario_apellido: str
    medico_nombre: str
    medico_apellido: str