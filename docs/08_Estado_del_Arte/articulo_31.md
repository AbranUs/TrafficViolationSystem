# Estado del Arte - Artículo 31

## Información del Artículo
*   **Título:** Seguridad de APIs de Tránsito frente a Inyecciones SQL y Denegación de Servicio
*   **Autores:** O'Connor, D., & Sullivan, K.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Journal of Network and Computer Applications

---

## 1. Resumen (Abstract)
Se proponen marcos de seguridad defensivos para APIs públicas que manejan datos sensibles de infracciones viales de ciudadanos, evitando accesos ilegítimos o borrado de multas.

---

## 2. Metodología Propuesta
Uso de ORM mapeados (SQLAlchemy), consultas parametrizadas obligatorias y limitadores de tasa (rate-limiters) en endpoints críticos.

---

## 3. Resultados Obtenidos
Mitigación del 100% de los intentos de inyección SQL sin generar sobrecosto de latencia en las respuestas de la API.

---

## 4. Relación con Nuestro Proyecto
Justifica las prácticas de seguridad que aplicamos con SQLAlchemy y SonarQube para proteger nuestro backend.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
