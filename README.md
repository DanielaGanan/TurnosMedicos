Turnos Medicos
Sistema de gestión de turnos médicos con FastAPI (Backend) y React (Frontend).

🚀 Tecnologías
Backend: Python, FastAPI, SQLAlchemy, MySQL
Frontend: React, Vite

📦 Instalación
1. Clonar el repositorio
bashgit clone https://github.com/tuusuario/TurnosMedicos.git
cd TurnosMedicos

2. Configurar Backend
bashcd api

# Crear y activar entorno virtual
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux

# Instalar dependencias
pip install -r requirements.txt

cd ..

3. Configurar Frontend
bashcd client
npm install
cd ..

▶️ Ejecutar el Proyecto
Terminal 1 - Backend
bashcd api
.venv\Scripts\activate
uvicorn main:app --reload
Backend en: http://localhost:8000

Terminal 2 - Frontend
bashcd client
npm run dev
Frontend en: http://localhost:5173

📂 Estructura
TurnosMedicos/
├── api/                    # Backend (FastAPI)
│   ├── config/            # Configuración BD
│   ├── routers/           # Endpoints
│   ├── schemas/           # Validación
│   ├── services/          # Lógica de negocio
│   ├── main.py            # Archivo principal
│   └── requirements.txt   # Dependencias Python
│
└── client/                # Frontend (React)
    ├── src/               # Código fuente
    ├── public/            # Archivos estáticos
    └── package.json       # Dependencias npm


📝 Notas Importantes

NO subir a Git: .venv/, node_modules/, __pycache__/, .env

Siempre activar el entorno virtual antes de trabajar en el backend

Ejecutar git pull antes de empezar a trabajar


🌐 URLs Importantes

Frontend: http://localhost:5173

Backend API: http://localhost:8000


👥 Equipo

Gañan, Daniela Ailin

Gonzalez, Joaquin Nahuel
