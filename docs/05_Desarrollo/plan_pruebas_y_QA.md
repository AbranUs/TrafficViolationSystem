# Plan de Pruebas (Test Plan) y Aseguramiento de Calidad (QA)

Este documento detalla la planificación de pruebas, la estrategia de aseguramiento de calidad (QA) y los criterios de aceptación técnicos implementados para verificar la integridad del **TrafficViolationSystem**.

---

## 1. Estrategia de Pruebas y QA

Para certificar que la lógica de visión artificial y la persistencia de datos relacionales operen libre de fallos, el proyecto sigue un **modelo de pirámide de pruebas automatizadas**:

```
      /\
     /  \     Pruebas E2E (Simulación de subida en frontend e interfaz)
    /----\
   /      \   Pruebas de Integración (FastAPI Enrutadores, SQLAlchemy & Fallback DB)
  /--------\
 /          \ Pruebas Unitarias (Lógicas matemáticas del Tracker, reglas y cifrado)
/____________\
```

---

## 2. Niveles de Pruebas Implementados

### A. Pruebas Unitarias (Unit Testing)
Se centran en verificar de manera aislada la lógica algorítmica pura del sistema:
*   **Servicio de Reglas (`rules.py`)**: Valida el cálculo correcto del cruce de línea de semáforo, la detección del ángulo del giro en U y el tiempo de inmovilidad de parqueo en base a coordenadas artificiales de centroides.
*   **Criptografía y Autenticación (`auth_routes.py`)**: Valida que las contraseñas ingresadas generen el hash SHA-256 correcto concatenando la sal del sistema.
*   **Servicio de Visión (`ia_service.py`)**: Valida las conversiones de color OpenCV, el cálculo geométrico del centroide de cajas y el modo dual de inferencia (YOLOv8 vs Visión clásica por contornos).

### B. Pruebas de Integración (Integration Testing)
Verifican el correcto flujo de comunicación y persistencia entre diferentes módulos del backend:
*   **Conexión a Base de Datos (`db.py`)**: Valida que, ante una interrupción o ausencia del servidor PostgreSQL principal, el sistema redirija en caliente las transacciones de escritura y lectura al archivo SQLite local (`fallback.db`) y mantenga la consistencia relacional.
*   **Agregación de Analíticas**: Valida que las consultas SQL agrupadas de `/api/v1/analytics/stats` y `/operationalization` realicen los conteos matemáticos correctos y retornen el formato Pydantic estructurado.

### C. Pruebas de Sistema / End-to-End (E2E)
Simulan el ciclo completo del usuario:
*   Subir un video real de demostración, procesar el archivo en background, auditar las infracciones detectadas con OCR, resolver el propietario desde base de datos y validar los datos en el reproductor interactivo.

---

## 3. Matriz de Casos de Prueba Críticos

| ID Caso | Nivel de Prueba | Módulo Evaluado | Descripción del Caso | Entrada / Acción | Resultado Esperado (Pasa) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Unitario | `rules.py` | Evaluar detección de semáforo en rojo. | Vehículo cruza $y_{stop}$ con semáforo simulado en fase `RED`. | Retorna infracción `Cruce de Semáforo en Rojo` con confianza registrada. |
| **TC-02** | Unitario | `rules.py` | Evaluar maniobra de retorno en U. | Coordenadas Y del vehículo decrecen, alcanzan mínimo y vuelven a subir $> 15\%$. | Retorna infracción `Giro Prohibido en U`. |
| **TC-03** | Unitario | `rules.py` | Evaluar tiempo de inmovilidad en zona restringida. | Centroide del vehículo permanece en ROI de parqueo por $> 90$ frames. | Retorna infracción `Estacionamiento en Zona Peatonal / Prohibida`. |
| **TC-04** | Integración | `db.py` | Resiliencia de base de datos ante fallos. | Desconexión forzada de PostgreSQL y llamada a sesión SQL. | Crea archivo `fallback.db`, instancia tablas y ejecuta la consulta en SQLite sin interrupción de la API. |
| **TC-05** | Integración | `auth_routes.py` | Registro y login de usuario administrativo. | POST a `/api/v1/auth/login` con credenciales correctas. | Retorna código `200 OK` con un Bearer session token estructurado. |
| **TC-06** | Integración | `analytics_routes.py`| Consulta de Matriz de Operacionalización. | GET a `/api/v1/analytics/operationalization` con base relacional poblada. | Retorna los 9 indicadores de variables estructurados en JSON con su valor calculado. |

---

## 4. Cobertura de Código y Aseguramiento de Calidad (Quality Gates)

Para asegurar un estándar de desarrollo óptimo y libre de deuda técnica, el flujo de QA exige el cumplimiento de las siguientes métricas de calidad antes de liberar código a producción:
*   **Métrica de Cobertura de Código (Code Coverage)**: La suite de pruebas unitarias locales en PyTest debe registrar una cobertura de líneas de código del **100%** en los módulos de lógica del backend (`rules.py`, `yolo_predictor.py`, `operationalization`).
*   **Análisis Estático de Código (SonarQube)**: El código se analiza a través del escáner SonarQube. No se permite la presencia de alertas del tipo:
    *   *Bugs* críticos o vulnerabilidades de seguridad abiertas.
    *   *Cognitive Complexity* (Complejidad cognitiva) superior a 15 por función.
    *   Duplicación de líneas o ramas de código superior al 3%.
*   El cumplimiento de estas métricas asegura un producto robusto, escalable y mantenible a largo plazo.
