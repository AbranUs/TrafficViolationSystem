# Plan de Gestión del Cronograma
## Proyecto: Sistema de Control y Detección de Infracciones de Tránsito mediante Inteligencia Artificial (TrafficViolationSystem)

---

## 1. Introducción y Metodología de Desarrollo

El presente Plan de Gestión del Cronograma define la metodología, los procesos, los hitos clave y la ruta crítica que rigen el ciclo de vida del desarrollo de software del **TrafficViolationSystem**. 

Para asegurar una entrega incremental y de alta calidad, el equipo adoptó un enfoque **Ágil adaptado con Scrum e Integración Continua (DevOps)**:
* **Sprints**: Iteraciones de dos semanas con metas claras para cada incremento (por ejemplo, motor de IA en el Sprint 1, base de datos relacional y fallback en el Sprint 2).
* **Calidad desde el inicio**: El cronograma contempla la validación de código limpio mediante auditorías estáticas periódicas con **SonarQube** para evitar acumulación de deuda técnica.
* **Revisiones periódicas**: Control de entregables e hitos cruzados con la Matriz de Control de Versiones del proyecto para asegurar que cada funcionalidad implementada responda a un requerimiento verificado.

---

## 2. Estructura de Desglose de Trabajo (EDT / WBS)

El alcance del proyecto se desglosa en 6 paquetes de trabajo principales, detallados a continuación:

```
1. TrafficViolationSystem
   ├── 1.1 Gestión del Proyecto y Planificación
   │     ├── 1.1.1 Acta de Constitución del Proyecto (Project Charter)
   │     ├── 1.1.2 Plan de Gestión de Cronograma y Ruta Crítica
   │     └── 1.1.3 Definición de Matriz de Operacionalización de Variables
   ├── 1.2 Modelado de Negocio e Inteligencia de Clientes
   │     ├── 1.2.1 Lienzo de Modelo de Negocio Canvas
   │     └── 1.2.2 Caso de Negocio y Análisis de ROI Vial
   ├── 1.3 Desarrollo del Núcleo de Visión Artificial (IA)
   │     ├── 1.3.1 Configuración de YOLOv8 Nano e Inferencia de Clases COCO
   │     ├── 1.3.2 Implementación del Algoritmo de Seguimiento Centroid Tracker
   │     └── 1.3.3 Lógicas de Infracción (Semáforo, Giro U, Zona Peatonal)
   ├── 1.4 Arquitectura, Base de Datos y APIs Relacionales
   │     ├── 1.4.1 Modelo Físico y Relacional de Datos en PostgreSQL/SQLite
   │     ├── 1.4.2 Conmutación Resiliente de Base de Datos (SQL Fallback)
   │     └── 1.4.3 Endpoints FastAPI (Carga de videos, Infracciones, Analíticas)
   ├── 1.5 Interfaz de Usuario (Frontend React SPA)
   │     ├── 1.5.1 Maquetación en Modo Oscuro y Estructura CSS Premium
   │     ├── 1.5.2 Reproductor de Video Sincronizado Bidireccionalmente (timeupdate)
   │     └── 1.5.3 Dashboard de Analíticas y Panel de Operacionalización
   └── 1.6 Calidad, Despliegue y Operación
         ├── 1.6.1 Pruebas Unitarias de Backend y Frontend (Cero Regresiones)
         ├── 1.6.2 Auditoría y Corrección de Bugs en SonarQube
         ├── 1.6.3 Manual de Instalación y Despliegue en Render Cloud / Docker
         └── 1.6.4 Manual de Operaciones para Oficiales de Tránsito
```

---

## 3. Cronograma Detallado y Ruta Crítica

El proyecto se desarrolla a lo largo de un horizonte temporal de 6 meses (24 semanas), estructurado en 6 fases secuenciales con hitos definidos:

### Fase 1: Planificación e Inicio (Semanas 1 - 4)
* **Actividades**: Reuniones de kick-off con stakeholders, definición del Project Charter, diseño conceptual del sistema, redacción del plan de cronograma e inicio de la investigación bibliográfica (compilación de artículos del Estado del Arte).
* **Entregables**: Acta de Constitución, Plan del Cronograma, Estructura de Base de Datos conceptual.
* **Hito de Salida**: Aprobación del alcance por el patrocinador (Fin de la Semana 4).

### Fase 2: Visión por Computadora y Motor de IA (Semanas 5 - 10)
* **Actividades**: Configuración del entorno de OpenCV y PyTorch, integración de YOLOv8 Nano, desarrollo del algoritmo Centroid Tracker para mantener identidades únicas entre fotogramas, codificación de las reglas matemáticas de infracción, e integración del lector OCR para matrículas.
* **Entregables**: Módulo `ia_service.py` inicial capaz de procesar streams físicos cuadro a cuadro.
* **Ruta Crítica**: La calibración del Centroid Tracker representa la tarea más sensible de esta fase, ya que un mal rastreo genera falsas multas.

### Fase 3: Infraestructura, Backend y Persistencia Resiliente (Semanas 11 - 14)
* **Actividades**: Creación de las tablas relacionales de la base de datos SQL (usuarios, videos, infracciones, multas, cámaras, oficiales), codificación del ORM con SQLAlchemy, diseño del enrutador FastAPI y desarrollo de la resiliencia de conexión (SQLite fallback).
* **Entregables**: APIs REST implementadas y documentadas con OpenAPI (Swagger), base de datos PostgreSQL de producción operativa.
* **Ruta Crítica**: La lógica de fallback en `db.py` debe ser probada exhaustivamente simulando caídas de base de datos para asegurar cero fugas transaccionales.

### Fase 4: Frontend React SPA y Reproductor Sincronizado (Semanas 15 - 18)
* **Actividades**: Construcción de la UI con React, creación del dropzone de carga masiva de videos con Axios y chunks de 1MB, codificación del reproductor HTML5 con recuadros de neón flotantes dibujados en caliente sobre el elemento `<video>` mediante su evento de tiempo nativo, y maquetación CSS con paleta HSL premium.
* **Entregables**: Aplicación web frontend totalmente interactiva y conectada al backend local.
* **Ruta Crítica**: La sincronización de coordenadas JSON del bounding box del vehículo en tiempo real con el segundo de reproducción del video.

### Fase 5: Aseguramiento de Calidad y Pruebas Unitarias (Semanas 19 - 21)
* **Actividades**: Redacción de scripts de prueba automatizados en PyTest, alcance del 100% de cobertura de código en las funciones lógicas de backend, levantamiento de la instancia SonarQube vía Docker, y corrección de bugs de complejidad cognitiva o duplicidad de ramas.
* **Entregables**: Suite de pruebas aprobada, reporte de calidad SonarQube con Quality Gate en estado "PASSED".

### Fase 6: Cierre, Documentación y Despliegue Cloud (Semanas 22 - 24)
* **Actividades**: Empaquetado del sistema en contenedores Docker, creación del manifiesto `render.yaml` para despliegue automatizado de la base de datos PostgreSQL, el backend FastAPI y el frontend estático, generación de manuales de usuario y técnicos, y entrega formal.
* **Entregables**: Sistema desplegado en la nube pública, manuales de instalación y operación.
* **Hito de Finalización**: Cierre oficial del proyecto y entrega de credenciales administrativas (Fin de la Semana 24).

---

## 4. Hitos Principales del Proyecto

| Hito | Descripción | Semana Objetivo | Entregable Clave |
| :--- | :--- | :--- | :--- |
| **M01: Alcance Cerrado** | Aprobación del Acta de Constitución del Proyecto | Semana 4 | Acta en PDF / MD firmada |
| **M02: Motor de Inferencia** | Inferencia YOLO y lógica de infracciones operativa | Semana 10 | Código de `ia_service.py` verificado |
| **M03: API & DB Operativos** | Endpoints FastAPI listos y PostgreSQL conectado | Semana 14 | Base de datos poblada e interactiva |
| **M04: Frontend Conectado** | SPA de React sincronizada con video e infracciones | Semana 18 | Interfaz en modo oscuro interactiva |
| **M05: Código Limpio** | Cobertura total y Quality Gate de SonarQube Passed | Semana 21 | Reporte XML de cobertura y logs SonarQube |
| **M06: Cierre de Despliegue** | Despliegue en Render y entrega de documentación completa | Semana 24 | URLs productivas y manuales en docs/ |

---

## 5. Gestión del Control de Cambios y Desviaciones

Para mitigar riesgos de desalineación en el cronograma, el proyecto sigue un flujo estructurado de control de cambios:
1. **Detección de Desviación**: Si un hito principal experimenta un retraso superior a 5 días hábiles, se dispara una alerta roja al Product Owner.
2. **Análisis de Causa Raíz**: El equipo evalúa si el retraso responde a problemas técnicos (e.g. errores de rendimiento en la GPU en la fase de IA) o cambios de alcance del cliente.
3. **Plan de Acción y Reprogramación**: Se formulan contramedidas (como el uso del modo de respaldo clásico offline de OpenCV si el modelo de red neuronal YOLO experimenta demoras en su inicialización local) para asegurar que el desarrollo frontend y del backend continúe de forma paralela sin bloqueos mutuos.
4. **Registro de Versiones**: Toda alteración en el cronograma se consigna en la matriz de control de versiones y en el repositorio Git mediante commits etiquetados.
