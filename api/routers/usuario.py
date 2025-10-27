from typing import List
# Se usa para agrupar rutas (endpoints) relacionadas dentro de la API
from fastapi import APIRouter
from schemas.usuario import Usuario, UsuarioId
import services.usuario as services

router = APIRouter()

@router.get("/", response_model=List[UsuarioId])
async def listar_usuarios():
    return await services.get_all_usuarios()



