from datetime import datetime, date
from fastapi import HTTPException
from api.config.database import db



def _split_datetime(dt: datetime):
    """Separa en date y time"""
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    return dt.date().isoformat(), dt.time().strftime("%H:%M:%S")




async def crear_turno_sp(payload):
    """
    Crea un turno usando el SP ReservarTurno
    El SP valida:
    - Usuario y doctor activos
    - Día laboral (Lunes-Viernes)
    - Horario válido (8:00-15:30)
    - Turnos duplicados
    """

    fecha_turno, hora_turno = _split_datetime(payload.fecha_hora)
    # Llamar al Stored Procedure
    query = """
        CALL ReservarTurno(
            :id_usuario, 
            :id_doctor, 
            :fecha_turno, 
            :hora_turno, 
            :motivo_consulta,
            @p_resultado,
            @p_mensaje
        )
    """
    
    await db.execute(query=query, values={
        "id_usuario": payload.id_usuario,
        "id_doctor": payload.id_doctor,
        "fecha_turno": fecha_turno,
        "hora_turno": hora_turno,
        "motivo_consulta": payload.motivo,
    })
    
    # Obtener resultados del SP y manejar el potencial fallo de comunicación
    result = await db.fetch_one(
        query="SELECT @p_resultado AS resultado, @p_mensaje AS mensaje"
    )
    
    id_turno_creado = None

    if result and result["resultado"] is not None:
        # La consulta de resultados funciono correctamente
        resultado = result["resultado"]
        mensaje = result["mensaje"]

        # Validación de SP 
        if resultado < 0:
            # Error de validacion
            raise HTTPException(status_code=400, detail=mensaje)
        
        # exito: el resultado es el ID del turno creado
        id_turno_creado = resultado
        
    else:
        last_id_row = await db.fetch_one(query="SELECT LAST_INSERT_ID() AS id")
        
        if last_id_row and last_id_row["id"]:
            # Éxito de respaldo
            id_turno_creado = last_id_row["id"]
        else:
            # Fallo crítico: no se pudo obtener el ID
            raise HTTPException(
                status_code=500, 
                detail="Error critico: Turno reservado, pero no se pudo obtener el ID para la respuesta."
            )

    # Devolver el TurnoOut completo
    if id_turno_creado:
        return await obtener_turno(id_turno_creado) 
    else:
        # Caso de error no manejado
        raise HTTPException(status_code=500, detail="Fallo inesperado al obtener ID del turno.")



async def cancelar_turno_sp(id_turno: int, id_usuario: int):
    """
    Cancela un turno usando el SP CancelarTurno
    
    El SP valida:
    - Turno existe
    - Usuario es dueño del turno
    - Turno no está ya cancelado
    """
    query = """
        CALL CancelarTurno(
            :id_turno,
            :id_usuario,
            @p_resultado,
            @p_mensaje
        )
    """
  
    await db.execute(query=query, values={
    "id_turno": id_turno,
    "id_usuario": id_usuario,
    })

    # Obtener resultados del SP
    result = await db.fetch_one(
        query="SELECT @p_resultado AS resultado, @p_mensaje AS mensaje"
    )
    
    resultado = result["resultado"]
    mensaje = result["mensaje"]
    
    # Mapear errores a codigos HTTP apropiados
    if resultado == -2:
        raise HTTPException(status_code=404, detail=mensaje)  # No existe
    elif resultado == -3:
        raise HTTPException(status_code=403, detail=mensaje)  # Sin permisos
    elif resultado <= 0:
        raise HTTPException(status_code=400, detail=mensaje)  # Otro error
    
    return {"success": True, "mensaje": mensaje}



# Funciones del sp
async def listar_turnos(id_usuario: int = None, id_doctor: int = None):
    """Lista turnos activos con filtros opcionales y ordenados por hora"""
    query = """
        SELECT 
            id_turno, 
            id_usuario, 
            id_doctor,
            CAST(CONCAT(fecha_turno, ' ', hora_turno) AS DATETIME) AS fecha_hora,
            motivo_consulta AS motivo,
            activo
        FROM turnos 
        WHERE activo = 1
    """
    
    values = {}
    
    if id_usuario:
        query += " AND id_usuario = :id_usuario"
        values["id_usuario"] = id_usuario
    
    if id_doctor:
        query += " AND id_doctor = :id_doctor"
        values["id_doctor"] = id_doctor
    
    query += " ORDER BY fecha_turno DESC, hora_turno DESC"
    
    return await db.fetch_all(query=query, values=values)


async def listar_turnos_detalle(id_usuario: int = None, id_doctor: int = None):
    """Lista turnos CON información de usuario y doctor"""
    query = """
        SELECT 
            t.id_turno,
            t.id_usuario,
            t.id_doctor,
            CAST(CONCAT(t.fecha_turno, ' ', t.hora_turno) AS DATETIME) AS fecha_hora,
            t.motivo_consulta AS motivo,
            t.activo,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            d.nombre AS medico_nombre,
            d.apellido AS medico_apellido
        FROM turnos t
        JOIN usuarios u ON u.id_usuario = t.id_usuario
        JOIN doctores d ON d.id_doctor = t.id_doctor
        WHERE t.activo = 1
    """
    
    values = {}
    
    if id_usuario:
        query += " AND t.id_usuario = :id_usuario"
        values["id_usuario"] = id_usuario
    
    if id_doctor:
        query += " AND t.id_doctor = :id_doctor"
        values["id_doctor"] = id_doctor
    
    query += " ORDER BY t.fecha_turno DESC, t.hora_turno DESC"
    
    return await db.fetch_all(query=query, values=values)


async def obtener_turno(id_turno: int):
    """Obtiene un turno por ID"""
    query = """
        SELECT 
            id_turno,
            id_usuario,
            id_doctor,
            CAST(CONCAT(fecha_turno, ' ', hora_turno) AS DATETIME) AS fecha_hora,
            motivo_consulta AS motivo,
            activo
        FROM turnos 
        WHERE id_turno = :id_turno
    """
    
    row = await db.fetch_one(query=query, values={"id_turno": id_turno})
    
    if not row:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    return row


async def obtener_disponibilidad(id_doctor: int, fecha: date):
    """Obtiene horarios disponibles de un doctor en una fecha"""
    
    # Horarios posibles (8:00 a 15:30 cada 30 min)
    horarios_posibles = [
        '08:00:00', '08:30:00', '09:00:00', '09:30:00',
        '10:00:00', '10:30:00', '11:00:00', '11:30:00',
        '12:00:00', '12:30:00', '13:00:00', '13:30:00',
        '14:00:00', '14:30:00', '15:00:00', '15:30:00'
    ]
    
    # Obtener turnos ocupados
    query = """
        SELECT hora_turno 
        FROM turnos 
        WHERE id_doctor = :id_doctor 
        AND fecha_turno = :fecha_turno 
        AND activo = 1
    """
    
    turnos_ocupados = await db.fetch_all(query=query, values={
        "id_doctor": id_doctor,
        "fecha_turno": fecha.isoformat()
    })
    
    horas_ocupadas = [str(row["hora_turno"]) for row in turnos_ocupados]
    
    # Filtrar horarios disponibles
    disponibles = [h for h in horarios_posibles if h not in horas_ocupadas]
    
    return disponibles