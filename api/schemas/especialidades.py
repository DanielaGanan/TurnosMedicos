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
    
    # Pydantic v2: reemplaza orm_mode por from_attributes
    model_config = {"from_attributes": True}
