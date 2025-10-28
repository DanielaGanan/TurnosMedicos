from pydantic import BaseModel
from typing import Optional

class EspecialidadBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: Optional[bool] = True

class EspecialidadCreate(EspecialidadBase):
    pass

class EspecialidadOut(EspecialidadBase):
    id_especialidad: int

    class Config:
        orm_mode = True
