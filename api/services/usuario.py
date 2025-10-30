from datetime import datetime
from typing import List
from fastapi import HTTPException
from config.database import db
from schemas.usuario import Usuario, UsuarioId, UsuarioCreate
# Para trabajar con contraseñas encriptadas
import hashlib
from passlib.context import CryptContext

# Para encriptar contraseñas con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Para hashear contra
def hash_password(password: str) -> str:
    """Encripta la contraseña"""
    return pwd_context.hash(password)

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Para obtener todos los usuarios
async def get_all_usuarios() -> List[Usuario]:
    query = "SELECT * FROM usuarios"
    rows = await db.fetch_all(query=query)
    return rows


# Para obtener un usuario con su id
async def get_usuarios_by_id(id: int) -> UsuarioId:
    query = "SELECT * FROM usuarios WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return row


# Para obtener usuario con email
async def get_usuarios_by_email(email: str) -> UsuarioId:
    query = "SELECT * FROM usuarios WHERE email = :email"
    row = await db.fetch_one(query=query, values={"email": email})
    return row


# Para obtener usuario con dni
async def get_usuarios_by_dni(dni: str) -> UsuarioId:
    query = "SELECT * FROM usuarios WHERE dni = :dni"
    row = await db.fetch_one(query=query, values={"dni": dni})
    return row


# Registrar un nuevo usuario
async def create_usuario(usuario: UsuarioCreate):

    #Verificamos mail y dni
    existeEmail = await get_usuarios_by_email(usuario.email)
    if existeEmail:
        raise HTTPException(status_code=400, detail="El email ya existe")

    existeDni = await get_usuarios_by_dni(usuario.dni)
    if existeDni:
        raise HTTPException(status_code=400, detail="El dni ya existe")
    

    # Encriptar contraseña
    hashed_password = hash_password(usuario.password)

    query = """
            INSERT INTO usuarios (nombre, apellido, email, password, telefono, 
            dni, fecha_nacimiento, direccion, activo)
            VALUES (:nombre, :apellido, :email, :password, :telefono, 
            :dni, :fecha_nacimiento, :direccion, :activo)
    """

    values = {
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "password": hashed_password,
        "telefono": usuario.telefono,
        "dni": usuario.dni,
        "fecha_nacimiento": usuario.fecha_nacimiento,
        "direccion": usuario.direccion,
        "activo": usuario.activo
    }


    #Insertar un usuario y recordar el ultimo id
    last_record_id = await db.execute(query=query, values=values)

    return {
        "mensaje": "Usuario registrado exitosamente",
        "id_usuario": last_record_id,
        "nombre": usuario.nombre,
        "email": usuario.email
    }

# LOGIN
async def login_usuario(email: str, password: str):
    usuario = await get_usuarios_by_email(email)

    if not usuario:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrecto")
    
 # Verificar contraseña
    if not verificar_password(password, usuario['password']):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    
    # Verificar si esta activo
    if not usuario['activo']:
        raise HTTPException(status_code=403, detail="Usuario inactivo")
    
    return {
        "mensaje": "Login exitoso",
        "id_usuario": usuario['id_usuario'],
        "nombre": usuario['nombre'],
        "apellido": usuario['apellido'],
        "email": usuario['email'],
        "dni": usuario['dni']
    }
    

#Actualizar los datos del usuario
async def update_usuario(usuario_id: int, usuario: Usuario) -> UsuarioId:

    # Verificamos si existe el id
    existeId = await get_usuarios_by_id(usuario_id)
    if not existeId:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    #Datos duplicados
    existeEmail = await get_usuarios_by_email(usuario.email)
    if existeEmail and existeEmail['id_usuario'] != usuario_id: 
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    
    existeDni = await get_usuarios_by_dni(usuario.dni)
    if existeDni and existeDni['id_usuario'] != usuario_id:
        raise HTTPException(status_code=400, detail="El dni ya esta registrado")
    

    hashed_password = hash_password(usuario.password)

    query = """

        UPDATE usuarios
        SET nombre = :nombre,
            apellido = :apellido,
            email = :email,
            password = :password,
            telefono = :telefono,
            dni = :dni,
            fecha_nacimiento = :fecha_nacimiento,
            direccion = :direccion,
            activo = :activo
        WHERE id_usuario = :id_usuario
    """

    values = {
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "password": hashed_password,
        "telefono": usuario.telefono,
        "dni": usuario.dni,
        "fecha_nacimiento": usuario.fecha_nacimiento,
        "direccion": usuario.direccion,
        "activo": usuario.activo,
        "id_usuario": usuario_id
    }

    await db.execute(query=query, values=values)
    {
        **usuario.dict(), 
        "id_usuario": usuario_id,  
        "password": hashed_password,
        "fecha_registro": existeId['fecha_registro'] 
    }

# Desactivar usuario (eliminar)
async def delete_usuario(id: int):
    usuario = await get_usuarios_by_id(id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    query = "UPDATE usuarios SET activo = 0 WHERE id_usuario = :id_usuario"
    await db.execute(query=query, values={"id_usuario": id})
    return {"mensaje": "Usuario desactivado"}


# Activar usuario
async def activate_usuario(id: int):
    usuario = await get_usuarios_by_id(id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    query = "UPDATE usuarios SET activo = 1 WHERE id_usuario = :id_usuario"
    await db.execute(query=query, values={"id_usuario": id})
    return {"mensaje": "Usuario activado"}
    

# Login
#async def login_usuario(email: str, password: str) -> UsuarioId:
   # usuario = await get_usuarios_by_email(email)
   # if not usuario:
   #     raise HTTPException(status_code=401, detail="Datos incorrectos")
    
    #Verificaciones
  #  hashed_password = hash_password(password)
  #  if usuario['password'] != hashed_password:
  #      raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    
  #  if not usuario['activo']:
  #      raise HTTPException(status_code=403, detail="Usuario inactivo")
    
  #  return usuario