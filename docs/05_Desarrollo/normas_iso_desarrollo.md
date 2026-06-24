# Estándares de Calidad e Ingeniería de Software (ISO 9001, 25000, 29119 y 27000)

El ciclo de vida del desarrollo de software y aseguramiento de la calidad de **TrafficViolationSystem** se alinea estrictamente con los estándares internacionales más representativos de la industria. A continuación se detalla la justificación y aplicación de las normas **ISO 9001**, **ISO 25000**, **ISO 29119** e **ISO 27000** en el proyecto.

---

## 1. ISO 9001:2015 (Gestión de Procesos y Satisfacción del Cliente)

El estándar **ISO 9001** norma los Sistemas de Gestión de Calidad (SGC) enfocado en procesos consistentes y la mejora continua.
*   **Enfoque en Procesos**: El desarrollo del sistema se estructuró dividiendo las responsabilidades técnicas del proyecto en flujos claros (Análisis de requisitos, Diseño de base de datos, Inferencia de visión artificial, APIs, Integración Frontend y QA).
*   **Mejora Continua (Ciclo PHVA - Planificar, Hacer, Verificar, Actuar)**:
    *   *Planificar*: Definición del Project Charter, cronograma y los indicadores de la Matriz de Operacionalización.
    *   *Hacer*: Codificación modular del backend FastAPI y frontend React.
    *   *Verificar*: Ejecución de la suite de pruebas unitarias locales y análisis estático con SonarQube.
    *   *Actuar*: Refactorización de duplicidad de código y calibración de bounding boxes de semáforos/taxis en base a revisiones de operadores.

---

## 2. ISO/IEC 25000 (SQuaRE - Evaluación de la Calidad del Producto de Software)

La familia de normas **ISO 25000** guía la evaluación de las características de calidad del producto de software. El sistema se alinea con este modelo a través de 8 sub-características críticas:

1.  **Adecuación Funcional**: El software cumple con el 100% de las especificaciones de negocio (detección automática de giros prohibidos en U, cruce de semáforo en rojo y estacionamiento indebido en zona peatonal, OCR de placas y resolución de propietarios ciudadanos).
2.  **Eficiencia de Desempeño**:
    *   *Uso de Recursos*: La carga de archivos de video se realiza en bloques secuenciales de `1MB` escritos en disco de forma asíncrona, evitando el consumo excesivo de memoria RAM del servidor.
    *   *Tiempo de Procesamiento*: El motor de IA desacopla el análisis mediante FastAPI `BackgroundTasks`, liberando la conexión HTTP de inmediato. Adicionalmente, el procesamiento se optimiza con YOLOv8 e inferencias eficientes en PyTorch / OpenCV.
3.  **Usabilidad**: Interfaz en modo oscuro con diseño HSL premium y micro-animaciones, facilitando el control a operadores. Cuenta con un reproductor interactivo bidireccional sincronizado con salto automático a incidentes (`seek`).
4.  **Fiabilidad (Tolerancia a Fallos)**: Implementación del mecanismo de resiliencia en `db.py` que conmuta las transacciones en caliente de PostgreSQL a SQLite físico local (`fallback.db`) ante caídas de red, garantizando cero pérdida de datos.
5.  **Seguridad**: Autenticación Bearer token, almacenamiento cifrado de contraseñas de usuarios con algoritmo SHA-256 + semilla estática del sistema, y protección contra inyecciones SQL mediante consultas parametrizadas con ORM SQLAlchemy.
6.  **Mantenibilidad**: Código limpio estructurado en capas desacopladas, documentado en Markdown, con una suite de pruebas PyTest con cobertura del 100% de la lógica de backend y libre de duplicados u obsolescencias auditado por SonarQube.
7.  **Portabilidad**: El sistema está empaquetado en manifiestos Docker y blueprints de infraestructura como código en `render.yaml`, permitiendo desplegar la base de datos PostgreSQL, FastAPI y React SPA en cualquier entorno de nube.

---

## 3. ISO/IEC 29119 (Conceptos y Procesos de Pruebas de Software)

La norma **ISO 29119** define el estándar para el ciclo de vida del testing de software en las organizaciones.
*   **Pruebas Basadas en Riesgos**: Identificamos los riesgos críticos del negocio (e.g., falsos positivos de infracciones o fallas de base de datos) y diseñamos casos de prueba unitarios e integrados específicos (TC-01 a TC-06) en PyTest para mitigarlos.
*   **Documentación de Pruebas**: Elaboramos un Plan de Pruebas estructurado (`plan_pruebas_y_QA.md`) detallando las precondiciones, pasos de ejecución y resultados esperados.
*   **Automatización de Pruebas (Mantenimiento)**: Integración de reportes de ejecución automatizada XML/HTML de cobertura, asegurando que cada integración de código pase por la validación de regresión y cobertura del 100%.

---

## 4. ISO/IEC 27000 / 27001 (Sistemas de Gestión de Seguridad de la Información)

El estándar **ISO 27001** define los controles de ciberseguridad y protección de activos de información.
*   **Confidencialidad**: Los tokens Bearer asocian el ID del usuario encriptado con un hash criptográfico de un solo uso en `localStorage`. Las contraseñas de oficiales nunca viajan ni se almacenan en texto plano en la base de datos SQL.
*   **Integridad y Trazabilidad (Audit Logs)**: Cada acción crítica realizada en el sistema (ej. carga de videos, inicio de sesión, auditoría de infracciones) queda registrada de forma inalterable en la tabla `audit_logs` de la base de datos relacional PostgreSQL con campos específicos de marca temporal, usuario, acción y detalles del incidente (`ind_auditoria_sistema`), garantizando auditoría forense informática completa.
*   **Disponibilidad**: El fallback SQLite y la redundancia cloud en Render protegen la continuidad de las operaciones del control de tránsito.
