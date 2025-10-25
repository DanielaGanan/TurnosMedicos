from fastapi import FastAPI
from config.database import db

app = FastAPI(title="Sistema de Turnos Médicos - API")

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
