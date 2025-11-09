from datetime import datetime
from typing import List
from fastapi import HTTPException
from api.config.database import db
from api.schemas.usuario import Usuario, UsuarioId, UsuarioCreate, UsuarioPublic
# Para trabajar con contraseÃ±as encriptadas
import hashlib
from passlib.context import CryptContext

# Para encriptar contraseÃ±as con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Para hashear contra
def hash_password(password: str) -> str:
    """Encripta la contraseÃ±a"""
    return pwd_context.hash(password)

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Para obtener todos los usuarios (sin contraseÃ±as)
async def get_all_usuarios() -> List[UsuarioPublic]:
    query = (
        "SELECT id_usuario, nombre, apellido, email, telefono, dni, "
        "fecha_nacimiento, direccion, fecha_registro, activo "
        "FROM usuarios"
    )
    rows = await db.fetch_all(query=query)
    return rows


# Para obtener un usuario con su id
async def get_usuarios_by_id(id: int) -> UsuarioId:
    query = "SELECT * FROM usuarios WHERE id_usuario = :id_usuario"
    row = await db.fetch_one(query=query, values={"id_usuario": id})
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

    #Verificamos mail y dni (activos e inactivos)
    existeEmail = await get_usuarios_by_email(usuario.email)
    existeDni = await get_usuarios_by_dni(usuario.dni)

    # Conflictos con registros activos
    if existeEmail and existeEmail["activo"]:
        raise HTTPException(status_code=400, detail="El email ya existe")
    if existeDni and existeDni["activo"]:
        raise HTTPException(status_code=400, detail="El dni ya existe")

    # Encriptar contraseña
    hashed_password = hash_password(usuario.password)

    # Reactivar si existe inactivo
    objetivo = None
    if existeEmail and not existeEmail["activo"]:
        objetivo = existeEmail
        if existeDni and existeDni["id_usuario"] != existeEmail["id_usuario"] and existeDni["activo"]:
            raise HTTPException(status_code=400, detail="El dni ya existe con otro usuario")
    elif existeDni and not existeDni["activo"]:
        objetivo = existeDni
        if existeEmail and existeEmail["id_usuario"] != existeDni["id_usuario"] and existeEmail["activo"]:
            raise HTTPException(status_code=400, detail="El email ya existe con otro usuario")

    if objetivo:
        query_upd = """
            UPDATE usuarios SET
                nombre = :nombre,
                apellido = :apellido,
                email = :email,
                password = :password,
                telefono = :telefono,
                dni = :dni,
                fecha_nacimiento = :fecha_nacimiento,
                direccion = :direccion,
                activo = 1
            WHERE id_usuario = :id_usuario
        """
        values_upd = {
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "email": usuario.email,
            "password": hashed_password,
            "telefono": usuario.telefono,
            "dni": usuario.dni,
            "fecha_nacimiento": usuario.fecha_nacimiento,
            "direccion": usuario.direccion,
            "id_usuario": objetivo["id_usuario"],
        }
        await db.execute(query=query_upd, values=values_upd)
        return {
            "mensaje": "Usuario reactivado",
            "id_usuario": objetivo["id_usuario"],
            "nombre": usuario.nombre,
            "email": usuario.email,
        }

    # Insertar nuevo
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
        "activo": True,
    }

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
        raise HTTPException(status_code=401, detail="Email o contraseÃ±a incorrecto")
    
 # Verificar contraseÃ±a
    if not verificar_password(password, usuario['password']):
        raise HTTPException(status_code=401, detail="Email o contraseÃ±a incorrectos")
    
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

    #Datos duplicados contra activos e inactivos
    existeEmail = await get_usuarios_by_email(usuario.email)
    if existeEmail and existeEmail['id_usuario'] != usuario_id:
        if existeEmail['activo']:
            raise HTTPException(status_code=400, detail="El email ya esta registrado")
        else:
            raise HTTPException(status_code=400, detail="El email corresponde a un usuario inactivo. Reactivelo o use otro")

    existeDni = await get_usuarios_by_dni(usuario.dni)
    if existeDni and existeDni['id_usuario'] != usuario_id:
        if existeDni['activo']:
            raise HTTPException(status_code=400, detail="El dni ya esta registrado")
        else:
            raise HTTPException(status_code=400, detail="El dni corresponde a un usuario inactivo. Reactivelo o use otro")

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
    return {
        **usuario.dict(),
        "id_usuario": usuario_id,
        "password": hashed_password,
        "fecha_registro": existeId['fecha_registro']
    }# Desactivar usuario (eliminar)
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
  #      raise HTTPException(status_code=401, detail="ContraseÃ±a incorrecta")
    
  #  if not usuario['activo']:
  #      raise HTTPException(status_code=403, detail="Usuario inactivo")
    
  #  return usuario
