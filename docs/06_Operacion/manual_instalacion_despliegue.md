# Manual de Instalación y Despliegue
## Proyecto: Sistema de Control y Detección de Infracciones de Tránsito mediante Inteligencia Artificial (TrafficViolationSystem)

---

## 1. Requisitos Previos del Sistema

Antes de iniciar la instalación de los componentes del **TrafficViolationSystem**, asegúrese de que el entorno cumpla con las especificaciones de hardware y software detalladas a continuación.

### A. Requisitos de Hardware
* **Mínimo**:
  * Procesador Intel i5 / AMD Ryzen 5 (4 núcleos o superior).
  * 8 GB de memoria RAM.
  * 5 GB de espacio libre en disco para videos y modelos locales.
* **Recomendado (para Inferencia YOLO en producción)**:
  * Procesador Intel i7 / AMD Ryzen 7 (8 núcleos o superior).
  * 16 GB de memoria RAM.
  * Tarjeta gráfica dedicada NVIDIA (serie GTX / RTX) con soporte CUDA 11.8+ para aceleración por hardware de visión artificial.

### B. Requisitos de Software
* Sistema Operativo: Windows 10/11, macOS Ventura+, o Ubuntu 20.04 LTS+.
* **Python 3.10 o superior** (para ejecutar el backend FastAPI).
* **Node.js 18.0 o superior** y **npm** (para construir y compilar el frontend React).
* **Docker Desktop** (opcional, para auditorías SonarQube y despliegue de base de datos PostgreSQL local).
* **Git** (para control de versiones y clonación del repositorio).

---

## 2. Estructura de Directorios del Repositorio

La estructura del código fuente está diseñada para mantener un estricto desacoplamiento entre el cliente y el servidor:

```
TrafficViolationSystem/
├── backend/                  # Código del Servidor (FastAPI & SQLAlchemy)
│   ├── app/
│   │   ├── models/           # Definiciones ORM de SQLAlchemy y Esquemas Pydantic
│   │   ├── routes/           # Enrutadores API (Autenticación, Videos, Analíticas)
│   │   ├── services/         # Servicios Lógicos (ia_service, yolo_predictor, rules)
│   │   ├── uploads/          # Almacenamiento físico local de videos y frames JPG
│   │   ├── db.py             # Configuración de motores SQL y fallback
│   │   └── main.py           # Entrypoint e inicialización del servidor FastAPI
│   ├── tests/                # Suite de pruebas unitarias con PyTest
│   └── requirements.txt      # Dependencias del backend Python
├── frontend/                 # Código del Cliente (React SPA & Vite)
│   ├── src/
│   │   ├── components/       # Componentes reusables de UI
│   │   ├── pages/            # Páginas principales (Login, Upload, Report, Analytics)
│   │   ├── utils/            # Configuración de red y constantes globales
│   │   ├── App.jsx           # Enrutador principal de React y Guardia de Sesión
│   │   └── main.jsx          # Renderizador de la SPA
│   ├── package.json          # Dependencias y scripts de npm
│   └── vite.config.js        # Configuración del empaquetador Vite
└── render.yaml               # Manifiesto de infraestructura para despliegue Cloud
```

---

## 3. Instalación y Configuración del Backend

Siga los siguientes pasos en su terminal (utilizando PowerShell en Windows o Bash en Unix/Linux) para inicializar el servidor de desarrollo del backend:

### Paso 1: Configurar el Entorno Virtual
Es altamente recomendable aislar las dependencias del sistema operativo utilizando un entorno virtual de Python.
```bash
# Navegar a la carpeta del backend
cd backend

# Crear el entorno virtual en la carpeta .venv
python -m venv .venv

# Activar el entorno virtual (PowerShell - Windows)
.venv\Scripts\Activate.ps1

# Activar el entorno virtual (Bash - Unix/macOS)
source .venv/bin/activate
```

### Paso 2: Instalar Dependencias
Instale el archivo de dependencias utilizando `pip`:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```
> [!NOTE]
> Las dependencias principales incluyen `fastapi`, `uvicorn`, `sqlalchemy`, `opencv-python-headless` (para procesamiento de imágenes sin interfaz gráfica), `ultralytics` (para cargar YOLOv8), `pydantic`, `pytest` y drivers de bases de datos como `psycopg2-binary` (para PostgreSQL).

### Paso 3: Configurar Variables de Entorno
Cree un archivo `.env` en la raíz de la carpeta `backend/` con las siguientes variables básicas:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/traffic_violations
PORT=8000
HOST=127.0.0.1
```
* **Nota sobre la Base de Datos**: Si no tiene un servidor PostgreSQL activo, no se preocupe. La arquitectura en `db.py` detectará automáticamente el fallo de conexión al iniciar el servidor y creará un archivo de base de datos SQLite físico denominado `fallback.db` dentro del directorio `backend/app/`, sembrando de forma automática las tablas y usuarios necesarios.

### Paso 4: Ejecutar el Servidor Backend
Inicie el servidor ASGI Uvicorn:
```bash
$env:PYTHONPATH="."
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Al iniciarse correctamente, verá logs indicando que la base de datos se inicializó (sea PostgreSQL o SQLite Fallback) y la API estará accesible en la dirección: `http://127.0.0.1:8000/docs` (documentación interactiva de Swagger).

---

## 4. Instalación y Configuración del Frontend

Abra una nueva pestaña en su terminal para inicializar el cliente React SPA:

### Paso 1: Instalar Dependencias de Node
```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar los paquetes definidos en package.json
npm install
```

### Paso 2: Configurar la URL de Conexión del API
El frontend necesita saber en qué URL escucha el backend. Esto se gestiona dinámicamente en `frontend/src/utils/config.js`. 
* Por defecto en desarrollo local, apunta a `http://127.0.0.1:8000`.
* Si desea forzar una dirección específica, configure una variable de entorno en un archivo `.env.local` en la raíz de la carpeta `frontend/`:
  ```env
  VITE_BACKEND_URL=http://127.0.0.1:8000
  ```

### Paso 3: Ejecutar el Servidor Frontend de Vite
Inicie el servidor de desarrollo local:
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```
La aplicación web se compilará en caliente y estará accesible en el navegador en la dirección: `http://127.0.0.1:5173/`.

---

## 5. Ejecución de la Suite de Pruebas Locales (Calidad de Código)

Para garantizar que no haya regresiones lógicas ni fallas de sintaxis en el backend antes de realizar un despliegue, corra la suite de pruebas con PyTest:
```bash
cd backend
$env:PYTHONPATH="."
python -m pytest tests/
```
Para obtener estadísticas de cobertura de líneas de código detalladas:
```bash
python -m pytest --cov=app --cov-report=term-missing tests/
```

---

## 6. Despliegue Automatizado en Render Cloud

El proyecto cuenta con la especificación completa de infraestructura como código en el archivo `render.yaml` ubicado en la raíz del repositorio. Esto permite desplegar toda la arquitectura de extremo a extremo en la nube de Render de forma automatizada:

```yaml
services:
  # 1. Base de Datos Relacional de Producción
  - type: database
    name: traffic-violations-db
    databaseName: traffic_violations
    user: db_admin

  # 2. Web Service Backend (FastAPI)
  - type: web
    name: traffic-violations-backend
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 10000"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: traffic-violations-db
          property: connectionString

  # 3. Static Site Frontend (React SPA)
  - type: web
    name: traffic-violations-frontend
    env: static
    buildCommand: "cd frontend && npm install && npm run build"
    publishPath: "./frontend/dist"
    envVars:
      - key: VITE_BACKEND_URL
        fromService:
          type: web
          name: traffic-violations-backend
          property: host
```

### Pasos para Desplegar en Render:
1. Cree una cuenta en [Render.com](https://render.com/).
2. Conecte su cuenta de GitHub a Render.
3. Cree un nuevo servicio tipo **Blueprints** en Render y seleccione el repositorio `TrafficViolationSystem`.
4. Render leerá automáticamente el archivo `render.yaml` y creará la base de datos PostgreSQL, compilará el backend Python e instalará npm para compilar el frontend React, enlazando las variables de entorno de forma 100% segura y automática.
5. Al finalizar, Render le proveerá las URLs públicas para acceder a la aplicación en producción.
