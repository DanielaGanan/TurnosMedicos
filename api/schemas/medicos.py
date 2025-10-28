from pydantic import BaseModel, EmailStr
from typing import Optional

class MedicoBase(BaseModel):
    nombre: str
    apellido: str
    id_especialidad: int
    matricula: str
    email: EmailStr
    telefono: Optional[str] = None
    activo: Optional[bool] = True

class MedicoCreate(MedicoBase):
    pass

class MedicoOut(MedicoBase):
    id_doctor: int

    class Config:
        orm_mode = True
