# Manual del Usuario y Guía de Operaciones
## Proyecto: Sistema de Control y Detección de Infracciones de Tránsito mediante Inteligencia Artificial (TrafficViolationSystem)

---

## 1. Introducción

Bienvenido al manual del usuario del **TrafficViolationSystem**. Esta plataforma web interactiva ha sido diseñada para optimizar los flujos de trabajo de auditoría, control vial y fiscalización en centrales de tránsito urbano.

El sistema procesa archivos de video de cámaras de monitoreo vial e identifica de manera autónoma tres tipos de conductas infractoras:
* **Semáforo en Rojo**: Vehículos que cruzan la línea de parada demarcada cuando el ciclo del semáforo está en fase prohibitiva.
* **Giro Prohibido en U (U-Turn)**: Maniobras de cambio de dirección parabólicas en zonas no permitidas.
* **Estacionamiento Prohibido / Invasión Peatonal**: Coche que permanece inmóvil en una Región de Interés (ROI) restringida o cruce peatonal por más de 90 frames (aproximadamente 3 segundos).

Este documento explica paso a paso cómo iniciar sesión, gestionar la carga de metrajes, validar evidencias y analizar métricas de desempeño operativo del sistema.

---

## 2. Acceso y Control de Seguridad (Inicio de Sesión)

Para proteger los datos confidenciales de vehículos y ciudadanos, todas las funciones de administración y auditoría del sistema están restringidas a usuarios autenticados.

```
┌─────────────────────────────────────────────────────────────┐
│                       MODO OSCURO                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Iniciar Sesión                    │  │
│  │                                                       │  │
│  │   Usuario: [ admin                                ]   │  │
│  │   Contraseña: [ **********                        ]   │  │
│  │                                                       │  │
│  │              [   INGRESAR AL SISTEMA   ]              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Pasos para Ingresar:
1. Abra el navegador web e ingrese a la dirección del sistema (e.g. `http://127.0.0.1:5173/` en desarrollo local).
2. Si no ha iniciado sesión, el enrutador de React le redirigirá automáticamente a la pantalla de **Login**.
3. Ingrese las credenciales administrativas sembradas por defecto:
   * **Usuario**: `admin`
   * **Contraseña**: `admin123`
4. Presione el botón **Ingresar al Sistema**.
5. Al autenticarse correctamente, el backend FastAPI retornará un token de sesión seguro que se almacenará temporalmente en el `localStorage` de su navegador, desbloqueando la navegación global del panel.
6. Para cerrar su sesión en cualquier momento, haga clic en el botón **Cerrar Sesión** ubicado en el extremo derecho de la barra de navegación superior. Esto limpiará el token del navegador y bloqueará los accesos a los reportes.

---

## 3. Flujo Operativo: Carga de Videos para Análisis por IA

Una vez dentro de la plataforma, la pantalla inicial predeterminada es el módulo **Subir Video**. Este módulo permite enviar grabaciones de cámaras viales para su análisis automatizado.

### Pasos para Analizar un Video:
1. En la pestaña **Subir Video**, arrastre y suelte su archivo de video (formato `.mp4`, `.avi` o `.mov`) dentro de la dropzone rectangular con borde discontinuo neón, o haga clic en ella para seleccionar el archivo desde el explorador de archivos.
2. Una vez seleccionado el archivo, se mostrará el nombre del video y su tamaño. Presione el botón **Iniciar Análisis**.
3. El frontend enviará el archivo al servidor en fragmentos de `1MB` secuenciales para no saturar la memoria RAM. Verá una barra de carga indicando el porcentaje de subida.
4. Al completarse la subida, la interfaz mostrará la pantalla de procesamiento: **un semáforo animado en modo cargando** que cambia cíclicamente de luces para indicarle visualmente que el motor de Inteligencia Artificial (FastAPI + YOLOv8) está analizando cuadro a cuadro el video en segundo plano.
5. Puede ver el estado de los videos cargados previamente en la tabla de **Historial de Videos** ubicada en la parte inferior de la misma pantalla. Los estados posibles son:
   * `procesando` (círculo amarillo parpadeante).
   * `completado` (círculo verde de éxito).
   * `fallido` (círculo rojo con descripción del error).

---

## 4. Auditoría Interactiva y Sincronización de Evidencias (Reportes)

Cuando un video cambia a estado `completado`, puede hacer clic en la acción **Ver Reporte** del historial o navegar directamente a la pestaña **Reportes** en la barra superior.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                REPRODUCTOR                                  │
│  ┌───────────────────────────────────────────────┐ ┌──────────────────────┐ │
│  │                                               │ │ INFRACCIONES         │ │
│  │   [ Vehículo 9: Infracción Giro U ]           │ │                      │ │
│  │   ┌───────────────────────────────────────┐   │ │ - [00:04] Giro en U  │ │
│  │   │  [RECTÁNGULO ROJO]                    │   │ │                      │ │
│  │   │  Vehículo: Taxi Blanco                │   │ │ - [00:07] Luz Roja   │ │
│  │   │  Placa: AB-123-CD                     │   │ │   Placa: AB-123-CD   │ │
│  │   └───────────────────────────────────────┘   │ │                      │ │
│  │                                               │ │                      │ │
│  │  (Play)  00:04 / 00:15                        │ │                      │ │
│  └───────────────────────────────────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

Esta pantalla ofrece una experiencia de auditoría bidireccional única dividida en tres áreas principales:

### A. Reproductor de Video Central
Reproduce el metraje cargado. Mientras el video transcurre, el frontend lee los fotogramas clave. Si el segundo actual del reproductor coincide con el momento exacto en el que la IA detectó una infracción, se dibuja automáticamente un **recuadro neón flotante** sobre el reproductor de video con las coordenadas `x_min, y_min, x_max, y_max` exactas provistas por la base de datos SQL.

### B. Listado de Infracciones Lateral (Panel de Incidencias)
Muestra una lista secuencial de todas las multas encontradas en el video. Cada tarjeta de infracción muestra:
* El segundo exacto del incidente.
* Tipo de infracción cometida (Semáforo, Giro U, Zona Peatonal).
* Nivel de confianza arrojado por el modelo de IA.
* Un botón interactivo de **Saltar a Incidente**. Al hacer clic en este botón, el reproductor de video se desplazará automáticamente (`seek`) al segundo exacto en el que ocurrió la infracción, permitiendo validar la evidencia de forma inmediata.

### C. Ventana de Detalle de Evidencia (Modal de Boleta)
Al hacer clic sobre cualquier tarjeta de infracción, se abrirá una ventana modal de alta resolución que contiene la boleta de infracción digitalizada:
1. **Fotografía del Incidente**: Muestra el fotograma JPG guardado por el servidor donde OpenCV **dibuja un rectángulo de color rojo sólido** y una etiqueta neón encerrando al vehículo infractor y la señal de tránsito vulnerada.
2. **Lectura OCR de la Placa**: Muestra la matrícula identificada por la IA (e.g. `"AB-123-CD"`).
3. **Resolución de Propietario Relacional**: El sistema consulta las tablas cruzadas de la base de datos y muestra el Nombre Completo del Ciudadano propietario del vehículo (e.g. `"Juan Carlos Gomez Estrada"`) registrado en el padrón electoral vial, lo que da validez legal a la multa.
4. **Monto de la Multa**: Indica el valor económico base de la infracción y los puntos a deducir en la licencia.

---

## 5. Visualización del Panel de Analíticas y Dashboard Vial

La pestaña **Panel Analítico** recopila las agregaciones estadísticas en tiempo real de la base de datos, mostradas a través de componentes gráficos dinámicos:
* **KPIs Clave**: Tarjetas superiores con el acumulado total de videos procesados, total de infracciones detectadas e histórico del promedio de certeza de la IA.
* **Distribución Cuantitativa**: Un gráfico que desglosa porcentualmente la frecuencia de los tipos de infracciones para identificar qué conductas indebidas se cometen con mayor regularidad.
* **Tendencia Histórica**: Gráfico lineal cronológico que muestra la evolución de las multas detectadas día a día para medir la efectividad de las medidas disuasorias.
* **Bitácora Reciente**: Un mini-log en vivo con las últimas 5 infracciones procesadas en el servidor.

---

## 6. Módulo de Operacionalización de Variables

La pestaña **Operacionalización de Variables** es una ventana interactiva de control científico que expone los **9 indicadores operativos** de la variable independiente (Sistema de Control Vial por IA).

* Cada indicador se agrupa dentro de su correspondiente dimensión metodológica:
  * **Visión Artificial e Inferencia de Tránsito** (Precisión del modelo, confianza promedio, eficacia OCR de lectura de placas).
  * **Desempeño y Rendimiento Técnico** (Tasa de éxito del servidor, velocidad de inferencia promedio en segundos).
  * **Equipamiento y Cobertura de Infraestructura Vial** (Cámaras activas en línea, cobertura geográfica de intersecciones).
  * **Gestión de Control y Auditoría Operativa** (Agentes asignados a guardia activa, volumen de logs de auditoría registrados).
* Los indicadores calculan sus valores realizando agregaciones matemáticas en vivo sobre la base de datos SQL cada vez que el usuario presiona el botón **Refrescar Métricas**, asegurando transparencia científica absoluta en la evaluación de la plataforma.
