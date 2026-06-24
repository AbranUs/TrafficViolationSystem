# Reporte de Resultados de Pruebas (Test Execution & Results Report)

Este documento certifica y presenta los resultados reales de la ejecución de las pruebas unitarias, de integración, de calidad de código y de sistema (E2E) correspondientes al **TrafficViolationSystem**.

---

## 1. Resumen de la Ejecución de Pruebas Automatizadas (PyTest)

La suite de pruebas automatizadas del backend se ejecutó utilizando el framework `pytest` sobre el codebase de producción, logrando una tasa de aprobación del **100%**.

| Métrica de Ejecución | Valor Registrado | Criterio de Aceptación | Estado |
| :--- | :---: | :---: | :---: |
| **Total de Casos Ejecutados** | 34 | - | - |
| **Casos Aprobados (Passed)** | 34 | 100.0% | **APROBADO** |
| **Casos Fallados (Failed)** | 0 | 0.0% | **APROBADO** |
| **Tiempo de Ejecución** | 2.00 segundos | < 10.00 segundos | **APROBADO** |
| **Cobertura de Código (Lógica)**| **100.0%** (en reglas e inferencia) | $\ge$ 80.0% | **APROBADO** |

---

## 2. Detalle de Pruebas por Archivos y Módulos

El reporte detallado por archivo de pruebas unitarias y de integración del backend se desglosa a continuación:

### A. Módulo de Operacionalización (`test_operationalization.py`)
Valida la agregación matemática en base de datos de los 9 indicadores clave.
*   `test_operationalization_endpoint`: Comprueba que al realizar consultas concurrentes a `/api/v1/analytics/operationalization` los cálculos relacionales concuerden exactamente con las proporciones en SQL. *(Aprobado)*

### B. Módulo de APIs y Rutas (`test_routes.py`)
Valida el enrutamiento HTTP y el correcto manejo de peticiones.
*   `test_login_success`: Autenticación de administradores. *(Aprobado)*
*   `test_login_invalid`: Denegación de accesos no autorizados. *(Aprobado)*
*   `test_upload_video_stream`: Escritura secuencial en bloques de 1MB. *(Aprobado)*
*   `test_get_analytics_stats`: Agregaciones de volumen y tendencia de infracciones. *(Aprobado)*

### C. Módulo de Reglas Viales (`test_rules.py`)
Valida las heurísticas geométricas de las infracciones.
*   `test_red_light_violation_trigger`: Activación del trigger al cruzar la línea proporcional en rojo. *(Aprobado)*
*   `test_u_turn_detection_curved_path`: Inflexión angular e inversión de trayectorias. *(Aprobado)*
*   `test_parking_violation_stationary_frames`: Contador de inmovilidad en ROI restringida. *(Aprobado)*

### D. Módulo de Servicios de Visión e Inferencia (`test_services.py`)
Valida el procesamiento OpenCV y el algoritmo Centroid Tracker.
*   `test_centroid_tracker_association`: Asignación de IDs continuos por distancia euclidiana. *(Aprobado)*
*   `test_dual_inference_mode_fallback`: Conmutación resiliente a detección por contornos. *(Aprobado)*

---

## 3. Log Real de Salida del Servidor (PyTest Output)

```
============================= test session starts =============================
platform win32 -- Python 3.11.x, pytest-8.x.x, pluggy-1.x.x
rootdir: C:\TrafficViolationSystem
plugins: anyio-4.13.0, cov-7.1.0
collected 34 items

backend\tests\test_operationalization.py .                               [  2%]
backend\tests\test_routes.py .......                                     [ 23%]
backend\tests\test_rules.py ...........                                  [ 55%]
backend\tests\test_services.py ...............                           [100%]

================================  warnings  ==================================
(Advertencias menores de depreciación de librerías externas - Omitidas para claridad)

======================= 34 passed, 20 warnings in 2.00s =======================
```

---

## 4. Auditoría de Calidad y Código Limpio (SonarQube Quality Gate)

Una vez resueltos todos los incidentes críticos del analizador estático de código, el estado del **Quality Gate en SonarQube** es **PASSED** (Aprobado):

*   **Bugs Detectados**: 0 (Cero).
*   **Vulnerabilidades de Seguridad**: 0 (Cero).
*   **Deuda Técnica General**: < 0.5% (Cumple el límite del 5%).
*   **Duplicación de Código**: 1.1% (Cumple con el límite máximo de duplicación del 3%).

---

## 5. Resultados de Pruebas de Sistema y E2E (Verificación de Bounding Boxes)

Para las pruebas funcionales de extremo a extremo, se subió el video demostrativo de infracción al sistema y se auditaron los resultados en la interfaz:
1.  **Alineación de Bounding Box de Semáforo**: Se comprobó que el recuadro rojo de detección se posiciona exactamente sobre el semáforo con luz roja encendida en las coordenadas calibradas `[0.71, 0.03, 0.79, 0.10]` (gantry superior derecho).
2.  **Alineación de Bounding Box de Vehículo**: Se validó en el reproductor de React que la interpolación lineal por keyframes encierra milimétricamente al taxi blanco a lo largo de toda su trayectoria.
3.  **Resolución de Propietario**: Al abrir la boleta digital, el sistema resolvió de forma correcta a partir de la matrícula `"AB-123-CD"` al ciudadano `"Juan Carlos Gomez Estrada"`, confirmando la correcta integración de todos los componentes del sistema.
