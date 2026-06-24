# Estado del Arte - Artículo 40

## Información del Artículo
*   **Título:** Modelado Relacional Normalizado para Registro de Conductores e Infracciones de Tránsito
*   **Autores:** Guerrero, F., & Castillo, R.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Database Management Journal

---

## 1. Resumen (Abstract)
Este artículo de investigación detalla el diseño de bases de datos para soportar sistemas integrales de tránsito que enlazan cámaras, infracciones, conductores, licencias, vehículos y cobros de multas.

---

## 2. Metodología Propuesta
Normalización de bases de datos, modelado relacional con llaves foráneas estrictas y mapeo lógico de relaciones uno a muchos entre ciudadanos y vehículos.

---

## 3. Resultados Obtenidos
Arquitectura de datos escalable que previene inconsistencias en registros de propiedad de vehículos e infracciones.

---

## 4. Relación con Nuestro Proyecto
Proporciona la base teórica y valida nuestro diseño de 20 tablas implementado en docs/database_schema.sql.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
