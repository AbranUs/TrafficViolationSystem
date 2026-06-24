# Estado del Arte - Artículo 19

## Información del Artículo
*   **Título:** Garantías de Integridad de Datos y Auditoría en Plataformas de Gestión de Multas
*   **Autores:** Higgins, P., & Taylor, R.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Computers & Security Journal

---

## 1. Resumen (Abstract)
El artículo analiza los requisitos de seguridad y no repudio necesarios para almacenar la evidencia digital de infracciones vehiculares viales en servidores de entidades gubernamentales.

---

## 2. Metodología Propuesta
Uso de hashes SHA-256 para firmar archivos de imagen y registro estricto de accesos de auditoría mediante bases de datos relacionales normalizadas.

---

## 3. Resultados Obtenidos
Asegura la trazabilidad y la validez legal de las infracciones detectadas por cámaras automatizadas frente a apelaciones ciudadanas.

---

## 4. Relación con Nuestro Proyecto
Soporta el diseño de nuestra tabla `AuditLogs` y los endpoints de auditoría en el backend.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
