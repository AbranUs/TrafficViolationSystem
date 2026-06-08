# Análisis y Modelado Físico de Datos (SQLAlchemy + PostgreSQL)

Este documento presenta el modelado relacional de datos y las especificaciones físicas de almacenamiento para el sistema de control de infracciones de tránsito. El motor de persistencia relacional principal está configurado sobre **PostgreSQL**, utilizando el ORM **SQLAlchemy** en Python para la abstracción orientada a objetos de la base de datos.

---

## 1. Diagrama Entidad-Relación (DER)

La relación lógica entre las entidades de video cargados y las infracciones detectadas cuadro a cuadro en las trayectorias vehiculares sigue un patrón relacional de **uno a muchos (1:N)**. Un video puede registrar cero, una o múltiples infracciones, mientras que cada infracción pertenece obligatoriamente a un único video contenedor.

```mermaid
erDiagram
    videos {
        VARCHAR(36) id PK "UUID del video"
        VARCHAR(255) nombre_archivo "Nombre original del archivo"
        TIMESTAMP fecha_subida "Fecha y hora de carga (GMT)"
        VARCHAR(50) status "Estado: procesando, completado, fallido"
        VARCHAR(1000) error_message "Detalle de error si status=fallido"
        FLOAT tiempo_procesamiento_segundos "Duración del análisis de IA"
    }

    infracciones {
        VARCHAR(50) id PK "Identificador único de infracción"
        VARCHAR(36) video_id FK "Relación con videos.id"
        VARCHAR(100) tipo "Tipo de infracción detectada"
        VARCHAR(512) frame_path "Ruta de la imagen JPG guardada en disco"
        FLOAT timestamp "Marca de tiempo del incidente (segundos)"
        VARCHAR(500) descripcion "Explicación detallada del suceso"
        VARCHAR(20) placa_vehiculo "Matrícula del infractor (nullable)"
        FLOAT confianza "Nivel de confianza de detección (0.0 - 1.0)"
        JSON caja_delimitadora "Caja x_min, y_min, x_max, y_max"
    }

    videos ||--o{ infracciones : "registra (ON DELETE CASCADE)"
```

---

## 2. Diccionario de Datos Físicos

A continuación se detallan las restricciones, tipos de datos físicos y propósitos de cada columna de las tablas creadas en PostgreSQL.

### Tabla: `videos`
Almacena los metadatos de los flujos multimedia subidos desde el Frontend y el estado de procesamiento del motor de IA.

| Nombre de Columna | Tipo de Datos SQL | Clave | Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK** | `NOT NULL`, `PRIMARY KEY` | Identificador único de video generado mediante UUID v4. |
| `nombre_archivo` | `VARCHAR(255)` | | `NOT NULL` | Nombre original del archivo de video subido (e.g. `cruce_rojo.mp4`). |
| `fecha_subida` | `TIMESTAMP WITH TIME ZONE`| | `DEFAULT CURRENT_TIMESTAMP` | Fecha y hora exacta de subida de video con soporte de huso horario. |
| `status` | `VARCHAR(50)` | | `NOT NULL`, `DEFAULT 'procesando'` | Estado del ciclo de procesamiento (`procesando`, `completado`, `fallido`). |
| `error_message` | `VARCHAR(1000)` | | `NULLABLE` | Descripción del fallo del decodificador de video o motor de IA. |
| `tiempo_procesamiento_segundos`| `FLOAT` | | `NULLABLE` | Tiempo total consumido por el procesador cuadro a cuadro OpenCV. |

### Tabla: `infracciones`
Almacena cada uno de los incidentes viales detectados físicamente y clasificados en las lógicas geométricas del fotograma.

| Nombre de Columna | Tipo de Datos SQL | Clave | Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | **PK** | `NOT NULL`, `PRIMARY KEY` | ID de infracción concatenado con ID de video y regla de tránsito. |
| `video_id` | `VARCHAR(36)` | **FK** | `NOT NULL`, `FOREIGN KEY REFERENCES videos(id) ON DELETE CASCADE` | ID del video contenedor. Si se elimina el video, se borran sus infracciones asociadas en cascada. |
| `tipo` | `VARCHAR(100)` | | `NOT NULL` | Clasificación de infracción (`Cruce de semáforo en rojo`, `Giro prohibido`, `Invasión de paso peatonal`). |
| `frame_path` | `VARCHAR(512)` | | `NOT NULL` | Ruta física absoluta o relativa del fotograma destacado guardado en disco (.jpg). |
| `timestamp` | `FLOAT` | | `NOT NULL` | Segundo exacto del metraje del video en el que ocurrió el incidente. |
| `descripcion` | `VARCHAR(500)` | | `NOT NULL` | Descripción de la regla violada y los parámetros de suceso. |
| `placa_vehiculo` | `VARCHAR(20)` | | `NULLABLE` | Matrícula vehicular detectada mediante el OCR integrado de la IA. |
| `confianza` | `FLOAT` | | `NOT NULL` | Nivel de certidumbre matemática de la inferencia (0.0 a 1.0). |
| `caja_delimitadora` | `JSON` | | `NOT NULL` | Objeto estructurado JSON que contiene las coordenadas normales de delimitación del coche infractor. |

---

## 3. Configuración e Integración de PostgreSQL

### A. Variables de Entorno (Conexión)
El servidor backend FastAPI y el cargador de SQLAlchemy leen las credenciales del servidor PostgreSQL de forma dinámica a través de la variable de entorno `DATABASE_URL`.

Formato estándar de conexión:
```bash
DATABASE_URL=postgresql://<usuario>:<contraseña>@<host>:<puerto>/<nombre_db>
```

Ejemplo para desarrollo local en archivo `.env` o consola de comandos:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/traffic_violations
```

### B. Inicialización Automática de Tablas
El punto de entrada principal del backend (`backend/app/main.py`) cuenta con un disparador del ciclo de vida en el evento `startup` que invoca `Base.metadata.create_all(bind=engine)`. Esto significa que **las tablas, índices y llaves foráneas se crean automáticamente en la base de datos PostgreSQL** la primera vez que se levanta el servidor, eliminando la necesidad de scripts SQL manuales.

### C. Despliegue Rápido con Docker (PostgreSQL)
Para levantar una base de datos local PostgreSQL lista para conectarse con la API en menos de un minuto, puede ejecutar el siguiente comando en su terminal:

```bash
docker run --name pg-violations -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=traffic_violations -p 5432:5432 -d postgres:15
```
