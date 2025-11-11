import os
from databases import Database

# Cargar variables desde .env (python-dotenv)
try:
    from dotenv import load_dotenv 
    load_dotenv()
except Exception:
    pass

# No exponemos credenciales en el codigo
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no configurada. Defínela en el entorno o en un archivo .env"
    )

db = Database(DATABASE_URL)

async def connect_db():
    await db.connect()

async def disconnect_db():
    await db.disconnect()
    