from sqlalchemy import (
    MetaData, Table, Column,
    Integer, String, Text, Boolean, ForeignKey, UniqueConstraint
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
