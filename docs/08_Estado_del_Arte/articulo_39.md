# Estado del Arte - Artículo 39

## Información del Artículo
*   **Título:** Detección de Conducción en Sentido Contrario mediante Análisis de Vectores de Movimiento
*   **Autores:** Müller, H., & Weber, A.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** IEEE Transactions on Intelligent Vehicles

---

## 1. Resumen (Abstract)
Los autores presentan un sistema autónomo para alertar sobre vehículos transitando en sentido opuesto en autopistas de un solo sentido mediante análisis continuo de flujo óptico y tracking.

---

## 2. Metodología Propuesta
Cálculo del gradiente de movimiento del centroide del vehículo sobre el eje de coordenadas vial y verificación condicional contra el sentido reglamentario de la calzada.

---

## 3. Resultados Obtenidos
Detección exitosa en menos de 1.5 segundos con un 98.4% de tasa de efectividad.

---

## 4. Relación con Nuestro Proyecto
Relacionado con las infracciones complejas de la calzada de la base de datos de nuestro sistema.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
