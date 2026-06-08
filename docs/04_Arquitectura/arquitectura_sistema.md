# Arquitectura del Sistema y Flujo de Datos Extremo a Extremo (End-to-End)

Este documento detalla la especificación de la arquitectura general de software, el mapa de componentes y el flujo de datos extremo a extremo (End-to-End) del sistema de control y detección de infracciones de tránsito por Inteligencia Artificial.

---

## 1. Mapa de Componentes y Capas del Sistema

El sistema sigue una arquitectura desacoplada **Cliente-Servidor de Alto Rendimiento** en el que el Frontend se encarga de la interfaz interactiva enriquecida y el Backend de la computación intensiva de vídeo (IA/OpenCV) y la persistencia relacional.

```mermaid
graph TB
    subgraph Capa de Presentación (React SPA)
        A[App.jsx - Navbar Global]
        B[UploadVideo.jsx - Carga e Historial]
        C[Report.jsx - Monitoreo Sincronizado]
        style A fill:#4f46e5,stroke:#312e81,color:#fff
        style B fill:#4f46e5,stroke:#312e81,color:#fff
        style C fill:#4f46e5,stroke:#312e81,color:#fff
    end

    subgraph Capa de API Gateway (FastAPI)
        D[main.py - Entrypoint & CORS]
        E[video_routes.py - Enrutador API]
        F[db.py - SQLAlchemy Session Manager]
        style D fill:#10b981,stroke:#065f46,color:#fff
        style E fill:#10b981,stroke:#065f46,color:#fff
        style F fill:#10b981,stroke:#065f46,color:#fff
    end

    subgraph Capa de Visión por Computadora (IA)
        G[ia_service.py - Motor OpenCV & YOLOv8]
        H[Centroid Tracker - Hilo Secundario]
        style G fill:#8b5cf6,stroke:#4c1d95,color:#fff
        style H fill:#8b5cf6,stroke:#4c1d95,color:#fff
    end

    subgraph Capa de Almacenamiento (Disco & SQL)
        I[PostgreSQL - Base de Datos Relacional]
        J[File System - /uploads/ & /uploads/frames/]
        style I fill:#f59e0b,stroke:#78350f,color:#fff
        style J fill:#f59e0b,stroke:#78350f,color:#fff
    end

    B -->|1. POST /upload-video| E
    C -->|4. GET /infracciones| E
    E -->|SQL Session| F
    F -->|Transacciones| I
    E -->|Background Task| G
    G -->|Lectura real| J
    G -->|Rastreo de objetos| H
    G -->|Escritura .jpg highlight| J
    G -->|Inserción SQL| I
    C -->|Servidor Estático /uploads| J
```

---

## 2. Flujo de Datos End-to-End en 4 Fases

A continuación se detalla técnicamente el ciclo de vida del flujo de datos del sistema, desde la interacción del usuario en el navegador hasta el almacenamiento final en la base de datos de producción y su posterior monitoreo.

### Fase 1: Carga e Inicialización (`UploadVideo.jsx` $\rightarrow$ API)
1. **Acción del Usuario**: El operador arrastra y suelta un archivo de video (e.g. `cruce.mp4`) en la dropzone interactiva de `UploadVideo.jsx`.
2. **Subida por Bloques**: Al hacer clic en "Iniciar Análisis", Axios realiza una solicitud `POST /api/v1/videos/upload-video` en formato `multipart/form-data`.
3. **Escritura Asíncrona en Servidor**: El backend recibe el flujo de datos y lo escribe en el disco en bloques secuenciales de `1MB` en la ruta `backend/app/uploads/{video_id}.mp4` para proteger el consumo de memoria RAM.
4. **Registro de Video en SQL**: Antes de iniciar el procesamiento pesado, el backend instancia y persiste el objeto ORM `Video` en la tabla `videos` de PostgreSQL con el estado `"procesando"`.

### Fase 2: Desacoplamiento y Tareas de Fondo (FastAPI $\rightarrow$ `ia_service`)
1. **Encolado de Tareas**: FastAPI utiliza su mecanismo nativo `BackgroundTasks` para encolar la llamada asíncrona de procesamiento:
   ```python
   background_tasks.add_task(process_video, video_path, video_id)
   ```
2. **Respuesta Inmediata**: FastAPI libera instantáneamente la petición HTTP devolviendo un código `201 Created` con el `video_id` y el estado `"procesando"` al cliente. Esto evita bloqueos de red o Timeouts (ya que la IA tardará varios segundos en analizar el vídeo).
3. **Cambio de Pantalla**: El frontend recibe el ID, lo guarda en `localStorage` y muestra la pantalla animada del semáforo cargando, activando el motor de polling periódico.

### Fase 3: Inferencia IA y Persistencia de Evidencias (`ia_service` $\rightarrow$ DB)
El hilo de ejecución en segundo plano ejecuta la canalización real de visión por computadora:
1. **Lectura Física**: Abre el archivo de video usando `cv2.VideoCapture`, leyendo FPS y fotogramas físicos.
2. **Inferencia de Objetos**: Procesa cuadro a cuadro usando **YOLOv8 Nano** (`yolov8n.pt`). Si el video es de prueba/sintético (círculos oscuros), el modelo YOLOv8 detecta 0 vehículos, conmutando de manera resiliente al analizador de contornos clásico de OpenCV (`cv2.findContours`).
3. **Seguimiento Continuo**: El Centroid Tracker asocia los centroides calculando la distancia euclidiana mínima entre cuadros y asigna un `track_id` único a cada vehículo.
4. **Evaluación de Infracciones**:
   * *Semáforo en Rojo*: Evalúa si el `track_id` cruza la línea horizontal divisoria mientras el ciclo de semáforo simulado está en fase `RED`.
   * *Giro en U*: Evalúa si la trayectoria del Y-vector de movimiento experimenta una inversión de sentido mayor al 15% del alto de la pantalla.
   * *Parqueo Prohibido*: Evalúa si el coche permanece inmóvil dentro del cuadrante restrictivo por más de 90 frames.
5. **Guardado de Frames JPG con Highlights**: Cuando se dispara una infracción, OpenCV crea una copia del cuadro del incidente, **dibuja un rectángulo de color rojo sólido** y una etiqueta con los datos, y la escribe físicamente en disco en `backend/app/uploads/frames/{infraccion_id}.jpg`.
6. **Confirmación en PostgreSQL**: Inserta un registro en la tabla `infracciones` vinculando `video_id`, `tipo`, la ruta física `frame_path`, `timestamp` en segundos, confianza, placa OCR y coordenadas JSON.
7. **Finalización de Video**: Al concluir el último fotograma, actualiza el registro del `Video` a `"completado"` y registra el tiempo consumido.

### Fase 4: Monitoreo y Sincronización Interactiva (`Report.jsx` $\leftarrow$ API)
1. **Carga del Reporte**: Al cambiar de pestaña, el buscador de `Report.jsx` lee el ID de `localStorage` de forma automática. Al hacer clic, consulta `GET /api/v1/videos/infracciones/{video_id}`.
2. **Respuesta Relacional unificada**: El backend realiza una consulta unificada de SQLAlchemy uniendo el `Video` y su arreglo de `infracciones` relacionadas, devolviéndolo en un solo JSON estructurado de Pydantic.
3. **Reproducción de Metrajes**: El reproductor HTML5 `<video>` reproduce estáticamente el video subido de la ruta estática `/uploads/{video_id}.mp4` expuesta por FastAPI.
4. **Sincronización Bidireccional `timeupdate`**:
   * *De Video a Interfaz*: Mientras el video corre, si `video.currentTime` coincide con el `timestamp` de alguna infracción, se dibuja dinámicamente un recuadro neón flotante sobre el reproductor en las coordenadas exactas de la caja y se resalta la tarjeta de la infracción en el panel lateral.
   * *De Interfaz a Video*: Al hacer clic en "Saltar a Incidente" en el menú de infracciones, el reproductor avanza automáticamente (`seek`) al segundo de la multa y reproduce el metraje, facilitando la auditoría de evidencias en alta resolución de forma interactiva.
