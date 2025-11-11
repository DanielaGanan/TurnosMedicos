# Estructura de los datos (que campos tiene), Valida automáticamente de datos
# convierte datos al tipo correcto si es posible y genera errores claros 
from pydantic import BaseModel, EmailStr
# Para que el valor pueda ser opcional
from typing import Optional
from datetime import date, datetime

class Usuario(BaseModel):
    nombre: str
    apellido: str
    email: str
    password: str
    telefono: str
    dni: str
    fecha_nacimiento: date
    direccion: str
    fecha_registro: datetime
    activo: bool = True


class UsuarioId(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    email: str
    password: str
    telefono: str
    dni: str
    fecha_nacimiento: date
    direccion: str
    fecha_registro: datetime
    activo: bool


class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    telefono: str
    dni: str
    fecha_nacimiento: date
    direccion: str


class UsuarioCreated(BaseModel):
    id_usuario: int
    nombre: str
    email: EmailStr
    mensaje: str | None = None


class UsuarioPublic(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str
    dni: str
    fecha_nacimiento: date
    direccion: str
    fecha_registro: datetime
    activo: bool


# Login
class LoginRequest(BaseModel):
    email: str
    password: str