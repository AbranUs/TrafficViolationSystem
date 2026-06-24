# Modelo de Negocio Canvas
## Proyecto: Sistema de Control y Detección de Infracciones de Tránsito mediante Inteligencia Artificial (TrafficViolationSystem)

---

El modelo de negocio de **TrafficViolationSystem** está estructurado bajo un enfoque B2G (Business-to-Government) y B2B (Business-to-Business), enfocado en proveer herramientas tecnológicas de vanguardia a las autoridades encargadas de la seguridad vial y el ordenamiento del tránsito. 

A continuación se detalla la estructura del lienzo Canvas del proyecto:

```
┌────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┐
│   ALIANZAS CLAVE       │   ACTIVIDADES CLAVE    │   PROPUESTA DE VALOR   │ RELACIÓN CON CLIENTES  │  SEGMENTOS DE CLIENTE  │
│                        │                        │                        │                        │                        │
│ - Fabricantes de       │ - Calibración y entrena-│ - Fiscalización vial   │ - Contratos de soporte │ - Municipalidades dis- │
│   cámaras de seguridad │   miento de YOLOv8.    │   automatizada 24/7 sin│   y mantenimiento SLA  │   tritales y provin-   │
│   e infraestructura.   │                        │   interrupción.        │   personalizados.      │   ciales.              │
│                        │ - Optimización del     │                        │                        │                        │
│ - Proveedores cloud    │   backend FastAPI e    │ - Evidencias visuales  │ - Talleres de capacita-│ - Ministerios de       │
│   (Render, AWS) con    │   integridad de la DB. │   irrefutables con     │   ción a operadores de │   Transporte y         │
│   servicios de GPU.    │                        │   rectángulos de color │   centrales viales.    │   Seguridad Vial.      │
│                        │ - Desarrollo de la UI  │   y marcas en fotos/vid.                        │                        │
│ - Pasarelas de pago    │   React interactiva.   │                        │ - Actualización de     │ - Concesionarias de    │
│   y entidades bancarias│                        │ - Resiliencia de datos │   modelos de IA y      │   carreteras y peajes  │
│   de recaudación.      │ RECURSOS CLAVE         │   gracias a la conmu-  │   parches de seguridad.│   privados.            │
│                        │                        │   tación a SQLite local│                        │                        │
│ - Centros de investiga-│ - Infraestructura de   │   (fallback.db).       │ CANALES                │                        │
│   ción vial y universi-│   GPU de inferencia.   │                        │                        │                        │
│   dades locales.       │                        │ - Panel interactivo de │ - Licitaciones públicas│                        │
│                        │ - Ingenieros FullStack │   auditoría con repro- │   y convenios del      │                        │
│                        │   y científicos de IA. │   ductor sincronizado. │   Estado.              │                        │
│                        │                        │                        │                        │                        │
│                        │ - Base de datos semilla│                        │ - Fuerza de ventas y   │                        │
│                        │   y API modularizada.  │                        │   concesiones directas.│                        │
├────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┤
│   ESTRUCTURA DE COSTOS                                                   │   FUENTES DE INGRESOS                                  │
│                                                                          │                                                        │
│ - Salarios del equipo de desarrollo, soporte y analistas de calidad.     │ - Licenciamiento SaaS mensual/anual por cámara vial    │
│ - Costos de infraestructura en la nube (Servidores, PostgreSQL y GPUs).  │   conectada al servicio de IA.                         │
│ - Campañas comerciales de marketing gubernamental e integraciones.       │ - Porcentaje de comisión por recaudación de multas     │
│ - Costos de soporte técnico post-venta y auditorías externas.            │   validadas (modelo por éxito).                        │
│                                                                          │ - Servicios de consultoría e integración API custom.   │
└──────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 1. Propuesta de Valor

El sistema ofrece una solución integral al control de tránsito urbano aportando valor diferencial en cuatro pilares:
* **Automatización y Eficiencia Operativa**: Reemplaza el patrullaje físico y los reportes de tránsito manuales por un motor de Inteligencia Artificial que procesa de manera autónoma las grabaciones viales 24/7. Detecta instantáneamente infracciones de cruce en rojo, giros prohibidos en U e invasiones de cruce peatonal.
* **Transparencia y Evidencias Irrefutables**: Cada multa generada por el sistema viene vinculada a un registro digital inalterable con: la confianza de la detección, la placa del vehículo identificada por OCR, los datos relacionales del ciudadano propietario, y un frame JPG procesado donde OpenCV **dibuja un rectángulo de color rojo sólido** encerrando la infracción.
* **Resiliencia de Datos de Extremo a Extremo**: Un sistema de control vial no puede perder registros por caídas de red o servidores. La arquitectura del sistema en `db.py` garantiza una disponibilidad del 100% mediante conmutación automática a base de datos SQLite física local (`fallback.db`) en caso de fallo de PostgreSQL.
* **Herramientas de Auditoría Rápida para Operadores**: La interfaz en modo oscuro de React incluye un reproductor sincronizado de video bidireccional. El operador de tránsito no tiene que buscar en horas de video; con un solo clic en la tarjeta de infracción, el reproductor realiza un salto (`seek`) al segundo exacto de la multa, mostrando dinámicamente los recuadros delimitadores sobre el video.

---

## 2. Segmentos de Clientes

* **Gobiernos Municipales (Alcaldías y Gerencias de Seguridad Ciudadana)**: Entidades gubernamentales interesadas en reducir la tasa de siniestralidad en intersecciones críticas y ordenar el tráfico de sus distritos.
* **Gobiernos Regionales y Ministerios de Transporte**: Entidades nacionales que supervisan autopistas principales y carreteras interprovinciales.
* **Concesionarias Viales Privadas**: Empresas que administran autopistas y peajes bajo contratos de concesión y necesitan controlar el respeto a la señalización de velocidad y giros viales.
* **Cuerpo de Policía Nacional / Divisiones de Tránsito**: Usuarios directos encargados de supervisar las centrales de videovigilancia y emitir las papeletas de infracción oficiales.

---

## 3. Canales

* **Licitaciones Públicas de Adquisición de Tecnología**: Participación en concursos del Estado para la modernización de centrales de videovigilancia urbana.
* **Venta Directa Corporativa**: Demostraciones directas en vivo del software a gerencias de tecnología de municipalidades y concesionarias viales mediante la carga de videos de prueba.
* **Alianzas con Integradores de Seguridad**: Venta del software empaquetado en conjunto con empresas que suministran e instalan cámaras IP de tránsito (cámaras domo, cámaras fijas viales).
* **Portal de Pruebas Web Demostrativo**: Acceso a un entorno web online (como Render) donde potenciales clientes evalúan la velocidad de inferencia del motor YOLOv8 subiendo sus propios clips MP4 de prueba.

---

## 4. Relación con los Clientes

* **SLA de Alta Disponibilidad**: Acuerdos de nivel de servicio (Service Level Agreements) que garantizan soporte técnico remoto 24/7 y tiempos de respuesta mínimos ante fallas críticas del servidor.
* **Capacitación y Onboarding**: Programas de inducción práctica dirigidos a oficiales y personal administrativo para el dominio rápido del reproductor sincronizado, la descarga de evidencias y el uso del panel de analíticas.
* **Actualización y Calibración Continua**: Envío periódico de parches de optimización para el motor de Inteligencia Artificial, mejorando la precisión y la lectura OCR del sistema en condiciones nocturnas o climáticas adversas.

---

## 5. Fuentes de Ingresos

* **Licenciamiento SaaS por Punto de Monitoreo**: Suscripción de pago mensual o anual por cada cámara IP vial conectada a los servidores de inferencia del sistema.
* **Comisión Variable por Éxito Operativo**: Modelo de ingresos complementario donde la municipalidad abona un pequeño porcentaje fijo por cada multa pagada que haya sido detectada e instrumentada en primera instancia por el sistema de IA de forma automática.
* **Servicios de Integración y Migración**: Cobros únicos de consultoría para realizar integraciones personalizadas del backend FastAPI con bases de datos nacionales de propiedad vehicular o pasarelas locales de pago de multas.

---

## 6. Recursos Clave

* **Tecnología e Inteligencia Artificial**: Modelos YOLOv8 preentrenados y optimizados, lógicas vectoriales de detección de giros en U y estacionamiento, y algoritmos robustos de seguimiento.
* **Infraestructura de Computación**: Servidores con soporte de aceleración gráfica por hardware (GPUs de nivel empresarial) capaces de ejecutar inferencias de video en tiempo real de forma paralela.
* **Equipo de Ingeniería y Soporte**: Desarrolladores full stack expertos en FastAPI/React, científicos de datos especializados en visión artificial, y analistas de ciberseguridad dedicados a resguardar la bitácora de auditoría.
* **Base de Datos Semilla Relacional**: Tablas SQL normalizadas con historial estructurado y relaciones íntegras entre infracciones, vehículos y ciudadanos propietarios.

---

## 7. Actividades Clave

* **Entrenamiento y Afinamiento de Redes Neuronales**: Etiquetado continuo de imágenes y entrenamiento sobre escenarios reales (carros locales, luz, lluvia) para elevar la tasa de confianza promedio por encima del 92%.
* **Optimización de Desempeño Backend**: Refactorización del código para garantizar que el tiempo medio de procesamiento por video en segundo plano se mantenga por debajo del tiempo de duración del video real.
* **Auditoría de Deuda Técnica y Seguridad**: Ejecución de suites de prueba automáticas locales (cobertura PyTest) y revisiones de seguridad en SonarQube para evitar inyecciones de código o accesos no autorizados.
* **Ventas y Relaciones Públicas**: Demostraciones comerciales del sistema a tomadores de decisiones gubernamentales.

---

## 8. Alianzas Clave

* **Fabricantes de Cámaras IP**: Colaboración para integrar el agente de software directamente en los chips de las cámaras de tránsito (computación perimetral / Edge Computing).
* **Proveedores Cloud e Infraestructura**: Asociaciones con plataformas cloud para hosting elástico a costes competitivos.
* **Ministerio de Transportes e Identificación Vehicular**: Convenios para el acceso seguro a través de APIs gubernamentales a las bases de datos de patentes y registros de identidad ciudadana.
* **Pasarelas de Recaudación Financiera**: Integraciones con pasarelas de pago virtuales para facilitar el pago inmediato de multas desde el enlace de la boleta de infracción.

---

## 9. Estructura de Costos

* **Costo de Servidores y Cómputo de IA**: Pago mensual por hosting de base de datos PostgreSQL, servidores FastAPI y servicios de procesamiento de video GPU en la nube.
* **Nómina del Personal Técnico**: Salarios del equipo de desarrollo de software, mantenimiento de bases de datos, ingenieros de soporte técnico y capacitadores.
* **Gastos Comerciales y de Distribución**: Inversiones en licitaciones, costos de marketing B2G, traslados e integraciones locales de hardware en intersecciones de prueba.
* **Servicios de Cumplimiento Normativo**: Certificaciones legales y de seguridad de la información necesarias para operar sistemas de multas automáticas conforme a las regulaciones nacionales de tránsito.
