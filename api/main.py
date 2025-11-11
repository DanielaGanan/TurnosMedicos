from fastapi import FastAPI
from api.config.database import db
from fastapi.middleware.cors import CORSMiddleware
from api.routers import especialidades, medicos, turnos, usuario
from api.routers.usuario import router as usuario_router


app = FastAPI(title="Sistema de Turnos Médicos - API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.connect()
    print("Conectado a la base de datos")


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()
    print("Desconectado de la base de datos")


@app.get("/")
async def root():
    #query = "SELECT COUNT(*) AS cantidad_turnos FROM turnos"
    #result = await db.fetch_one(query)
    return {"mensaje": "Conexión exitosa."}


app.include_router(usuario.router, prefix="/usuarios", tags=["Usuarios"])
# El router de turnos ya tiene prefix="/turnos" interno; no duplicar aquí
app.include_router(turnos.router)

app.include_router(especialidades.router)
app.include_router(medicos.router)
