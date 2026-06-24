# Matriz de Operacionalización de Variables
## Proyecto: Sistema de Control y Detección de Infracciones de Tránsito mediante Inteligencia Artificial (TrafficViolationSystem)

---

## 1. Definición Conceptual y Operacional de las Variables

Para validar científicamente el desempeño e impacto del **TrafficViolationSystem**, se ha modelado el marco metodológico del proyecto en torno a la relación de sus variables clave.

### A. Variable Independiente: Sistema de Control Vial Inteligente basado en Visión de Computadora (IA)
* **Definición Conceptual**: Es una plataforma de software integrada por redes neuronales convolucionales de detección de objetos, algoritmos lógicos de seguimiento y procesamiento de imágenes, diseñada para identificar automáticamente infracciones de tránsito a partir de señales de video y registrar evidencias relacionales en una base de datos estructurada.
* **Definición Operacional**: Se mide cuantitativamente a través de la precisión de los modelos de inferencia, la tasa de lectura automática de matrículas (OCR), la velocidad de procesamiento de video, la disponibilidad de la infraestructura y el volumen de auditoría operativa recopilados dinámicamente en tiempo real desde las tablas de la base de datos SQL.

### B. Variable Dependiente: Eficacia en la Fiscalización y Gestión de Siniestralidad Vial
* **Definición Conceptual**: Grado en el que las autoridades de tránsito reducen la impunidad vial, agilizan la auditoría de papeletas por los oficiales de tránsito, disminuyen los incidentes viales graves en intersecciones críticas y mejoran la recaudación económica de la municipalidad.
* **Definición Operacional**: Se mide mediante la reducción del tiempo promedio de validación de multas por los operadores (segundos por infracción), la reducción porcentual de apelaciones ciudadanas exitosas sustentadas en la inmutabilidad de la prueba, y la tendencia mensual de infracciones detectadas por el sistema.

---

## 2. Matriz de Operacionalización de Variables (Enfoque Cuantitativo)

El sistema calcula y expone los indicadores de la variable independiente en tiempo real mediante consultas SQL unificadas disponibles en el endpoint `/api/v1/analytics/operationalization`. A continuación, se detalla la matriz completa:

| Dimensión | Variable Operativa / Indicador | ID de Indicador | Fórmula Matemática de Cálculo | Tipo de Dato SQL / Campos de Mapeo Relacional | Instrumento de Recolección |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Visión Artificial e Inferencia de Tránsito** | **Tasa de Precisión de Modelos IA** | `ind_precision_modelo` | $$\frac{\sum \text{AIModel.accuracy\_score}}{\text{Total Modelos}} \times 100$$ | `Float` <br>Tabla: `ai_models`<br>Campo: `accuracy_score` | Ficha de evaluación técnica del modelo de IA (YOLOv8). |
| | **Nivel de Confianza Promedio** | `ind_confianza_infracciones` | $$\frac{\sum \text{Infraction.confianza}}{\text{Total Infracciones}} \times 100$$ | `Float` <br>Tabla: `infractions`<br>Campo: `confianza` | Registro de auditoría de confianza del motor de IA (`ia_service.py`). |
| | **Tasa de Eficacia de Detección de Placas (OCR)** | `ind_ocr_placas` | $$\frac{\text{Infracciones con Placa Registrada}}{\text{Total de Infracciones}} \times 100$$ | `String` (Filtro no nulo/vacío) <br>Tabla: `infractions`<br>Campo: `placa_vehiculo` | Ficha técnica de validación del servicio OCR de lectura de patentes. |
| **Desempeño y Rendimiento Técnico** | **Tasa de Éxito en Procesamiento de Videos** | `ind_exito_procesamiento` | $$\frac{\text{Videos con Estado "completado"}}{\text{Total de Videos Cargados}} \times 100$$ | `String` (Filtro 'completado') <br>Tabla: `videos`<br>Campo: `status` | Log de tareas en segundo plano de FastAPI (`BackgroundTasks`). |
| | **Velocidad Promedio de Inferencia por Video** | `ind_velocidad_inferencia` | $$\frac{\sum \text{Video.tiempo\_procesamiento}}{\text{Total de Videos Procesados}}$$ | `Float` (Segundos de duración) <br>Tabla: `videos`<br>Campo: `tiempo_procesamiento_segundos` | Temporizador interno de procesamiento OpenCV e inferencia PyTorch. |
| **Equipamiento y Cobertura de Infraestructura Vial** | **Tasa de Operatividad de Cámaras de Monitoreo** | `ind_operatividad_camaras` | $$\frac{\text{Cámaras con Estado "online"}}{\text{Total de Cámaras Registradas}} \times 100$$ | `String` (Filtro 'online') <br>Tabla: `cameras`<br>Campo: `status` | Registro de control de latido (*heartbeat*) de red vial IP. |
| | **Índice de Cobertura Geográfica de Monitoreo** | `ind_cobertura_geografica` | $$\frac{\text{Intersecciones con Cámaras Online}}{\text{Total de Intersecciones Registradas}} \times 100$$ | `String` (Conteo distinto de ids)<br>Tablas: `cameras` y `locations`<br>Campos: `location_id`, `locations.id` | Base de datos de geolocalización y mapa de intersecciones urbanas. |
| **Gestión de Control y Auditoría Operativa** | **Tasa de Personal de Guardia Activo** | `ind_personal_vial` | $$\frac{\text{Agentes con Asignación de Turno}}{\text{Total de Agentes Viales}} \times 100$$ | `String` (Conteo distinto)<br>Tablas: `officers`, `officer_assignments`<br>Campos: `badge_number` | Sistema de asignación de guardia, turnos y personal policial. |
| | **Volumen de Auditoría de Operaciones** | `ind_auditoria_sistema` | $$\text{Count}(\text{AuditLog.log\_id})$$ | `Integer` (Conteo absoluto)<br>Tabla: `audit_logs`<br>Campo: `log_id` | Bitácora de transacciones del sistema y auditoría de accesos. |

---

## 3. Correspondencia Técnica con el Código de Producción

Los indicadores y fórmulas matemáticas detallados en la matriz no representan valores estáticos ni simulaciones; se extraen de la base de datos SQL mediante agregaciones transaccionales implementadas en la API.

### A. Implementación en el Backend
El endpoint `/api/v1/analytics/operationalization` realiza las siguientes consultas relacionales equivalentes en Python utilizando el ORM de SQLAlchemy:

```python
# Consulta de Tasa de Precisión de Modelos IA (ind_precision_modelo)
avg_model_acc = db.query(func.avg(AIModel.accuracy_score)).scalar()
accuracy_score_val = round(float(avg_model_acc) * 100, 2) if avg_model_acc is not None else 0.0

# Consulta de Tasa de Eficacia de Detección de Placas (ind_ocr_placas)
total_infractions = db.query(Infraction).count()
infractions_with_plate = db.query(Infraction).filter(
    Infraction.placa_vehiculo != None, 
    Infraction.placa_vehiculo != ''
).count()
ocr_success_rate = round((infractions_with_plate / total_infractions * 100), 2) if total_infractions > 0 else 0.0

# Consulta de Índice de Cobertura Geográfica (ind_cobertura_geografica)
unique_locations_online = db.query(
    func.count(func.distinct(Camera.location_id))
).filter(Camera.status == 'online').scalar() or 0
total_locations = db.query(Location).count()
location_coverage_rate = round((unique_locations_online / total_locations * 100), 2) if total_locations > 0 else 0.0
```

### B. Consumo e Interfaz en el Frontend
El componente de React `VariableOperationalization.jsx` consume estos valores a través de Axios, aplicando filtros de dimensión y maquetándolos en una interfaz interactiva estructurada con clases de CSS específicas (`.matrix-layout`, `.kpi-grid`, `.table-panel`). Los valores de inmovilidad viales e inferencia se representan con colores neón para facilitar la lectura por los operadores:
* **Glow Indigo**: Representa métricas asociadas a la Visión Artificial e Inferencia.
* **Glow Violet**: Representa métricas asociadas al Desempeño y Rendimiento Técnico del Servidor.
* **Glow Cyan**: Representa métricas de la Infraestructura Física y Cámaras Viales.
* **Glow Green**: Representa métricas de la Auditoría y Personal de Guardia del Sistema.

Este mapeo directo entre la matriz teórica de investigación y el código fuente proporciona un valor científico único al software, garantizando la trazabilidad absoluta de las variables del proyecto.
