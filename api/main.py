from fastapi import FastAPI
from config.database import db
from routers import usuario
from fastapi.middleware.cors import CORSMiddleware
from routers.especialidades_medicos import router as em_router

app = FastAPI(title="Sistema de Turnos Médicos - API")

origins = [
    "http://localhost:5173",  # Puerto de Vite
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# 👇 habilita los endpoints /api/especialidades y /api/medicos)
app.include_router(em_router)

@app.get("/")
async def root():
    query = "SELECT COUNT(*) AS cantidad_turnos FROM turnos"
    result = await db.fetch_one(query)
    return {"mensaje": "Conexión exitosa ✅", "datos": result}

app.include_router(usuario.router, prefix="/usuarios")