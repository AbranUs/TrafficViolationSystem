# Estado del Arte - Artículo 05

## Información del Artículo
*   **Título:** Detección Automática de Infracciones por Giro Prohibido en Intersecciones Complejas
*   **Autores:** Kim, S. Y., & Lee, J. H.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** International Conference on Computer Vision (ICCV)

---

## 1. Resumen (Abstract)
Investigación sobre la detección de giros prohibidos en cruces semaforizados mediante el análisis de trayectorias vectoriales de vehículos y la definición de áreas poligonales restringidas de circulación.

---

## 2. Metodología Propuesta
Segmentación poligonal de áreas viales prohibidas y seguimiento de la trayectoria del centroide del vehículo para verificar intersecciones de vectores de dirección con las líneas restringidas.

---

## 3. Resultados Obtenidos
Sensibilidad de detección del 96.5% y tasa de falsos positivos inferior al 1.2% en intersecciones semaforizadas con oclusiones temporales.

---

## 4. Relación con Nuestro Proyecto
Justifica las heurísticas de cruce de líneas y polígonos que implementamos para la lógica de reglas del sistema.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
