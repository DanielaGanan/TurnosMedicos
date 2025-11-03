from sqlalchemy import (
    MetaData, Table, Column,
    Integer, String, Text, Boolean, ForeignKey, UniqueConstraint, DateTime, Date
)

metadata = MetaData()

especialidades = Table(
    "especialidades",
    metadata,
    Column("id_especialidad", Integer, primary_key=True, autoincrement=True),
    Column("nombre", String(100), nullable=False),
    Column("descripcion", Text, nullable=True),
    Column("activo", Boolean, default=True),
    UniqueConstraint("nombre", name="uq_especialidad_nombre")
)

medicos = Table(
    "doctores",  
    metadata,
    Column("id_doctor", Integer, primary_key=True, autoincrement=True),
    Column("nombre", String(100), nullable=False),
    Column("apellido", String(50), nullable=False),
    Column("id_especialidad", Integer, ForeignKey("especialidades.id_especialidad"), nullable=False),
    Column("matricula", String(50), nullable=False),
    Column("email", String(100), nullable=False),
    Column("telefono", String(20), nullable=True),
    Column("activo", Boolean, default=True)
)

usuarios = Table(
    "usuarios",
    metadata,
    Column("id_usuario", Integer, primary_key=True, autoincrement=True),
    Column("nombre", String(100), nullable=False),
    Column("apellido", String(100), nullable=False),
    Column("email", String(255), nullable=False),
    Column("password", String(255), nullable=False),
    Column("telefono", String(20), nullable=True),
    Column("dni", String(20), nullable=False),
    Column("fecha_nacimiento", Date, nullable=False),
    Column("direccion", String(255), nullable=True),
    Column("fecha_registro", DateTime, nullable=True),
    Column("activo", Boolean, default=True),
    UniqueConstraint("email", name="uq_usuario_email"),
    UniqueConstraint("dni", name="uq_usuario_dni"),
)

turnos = Table(
    "turnos",
    metadata,
    Column("id_turno", Integer, primary_key=True, autoincrement=True),
    Column("id_usuario", Integer, ForeignKey("usuarios.id_usuario"), nullable=False),
    Column("id_doctor", Integer, ForeignKey("doctores.id_doctor"), nullable=False),
    Column("fecha_hora", DateTime, nullable=False),
    Column("motivo", Text, nullable=True),
    Column("activo", Boolean, default=True),
    UniqueConstraint("id_doctor", "fecha_hora", name="uq_turno_doctor_fecha_hora")
)
