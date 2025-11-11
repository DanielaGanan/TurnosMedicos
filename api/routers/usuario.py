from typing import List
# Se usa para agrupar rutas (endpoints) relacionadas dentro de la API
from fastapi import APIRouter, HTTPException
from api.schemas.usuario import Usuario, UsuarioId, UsuarioCreate, UsuarioCreated, UsuarioPublic, LoginRequest
from api.services import usuario as services

router = APIRouter()

# Lista de usuarios
@router.get("/", response_model=List[UsuarioPublic])
async def listar_usuarios():
    return await services.get_all_usuarios()



@router.post("/login")
async def login (login_data: LoginRequest):
    """Login de usuario"""
    return await services.login_usuario(login_data.email, login_data.password)

# Registro de usuarios
@router.post("/register", response_model=UsuarioCreated)
async def register_usuario(usuario: UsuarioCreate):
    """Registrar un nuevo usuario"""
    existing_user = await services.get_usuarios_by_email(usuario.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    
    nuevo_usuario = await services.create_usuario(usuario)
    return nuevo_usuario


# Activar usuario
@router.post("/{id_usuario}/activate")
async def activar_usuario(id_usuario: int):
    return await services.activate_usuario(id_usuario)


# Desactivar usuario
@router.post("/{id_usuario}/deactivate")
async def desactivar_usuario(id_usuario: int):
    return await services.delete_usuario(id_usuario)
