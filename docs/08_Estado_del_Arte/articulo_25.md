# Estado del Arte - Artículo 25

## Información del Artículo
*   **Título:** Modelado Eficiente y Normalización de Bases de Datos para Sistemas Masivos de Infracciones
*   **Autores:** Castillo, D., & Medina, E.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Information Systems Frontiers

---

## 1. Resumen (Abstract)
Se analiza el diseño lógico y relacional óptimo para soportar millones de registros de infracciones y sus evidencias de imágenes sin degradar el tiempo de consulta.

---

## 2. Metodología Propuesta
Normalización hasta la tercera forma normal (3FN) con índices optimizados en claves foráneas y separación de blobs de imágenes en servidores de archivos estáticos.

---

## 3. Resultados Obtenidos
Tiempos de respuesta de consulta menores a 100 ms para millones de registros analíticos en bases de datos relacionales estándar.

---

## 4. Relación con Nuestro Proyecto
Soporta el diseño de 20 tablas de nuestra base de datos relacional y el almacenamiento de evidencias en disco/servidor estático.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
