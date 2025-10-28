from fastapi import FastAPI
from config.database import db
from fastapi.middleware.cors import CORSMiddleware
from routers import especialidades, medicos, usuario

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

@app.get("/")
async def root():
    query = "SELECT COUNT(*) AS cantidad_turnos FROM turnos"
    result = await db.fetch_one(query)
    return {"mensaje": "Conexión exitosa ✅", "datos": result}

app.include_router(usuario.router, prefix="/usuarios")
app.include_router(especialidades.router, prefix="/especialidades")
app.include_router(medicos.router, prefix="/medicos")