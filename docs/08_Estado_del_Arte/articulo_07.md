# Estado del Arte - Artículo 07

## Información del Artículo
*   **Título:** Seguimiento de Múltiples Objetos en Tráfico usando Filtros de Kalman y Algoritmo Húngaro
*   **Autores:** Wong, L. T., & Davies, M.
*   **Año de Publicación:** 2022
*   **Revista / Conferencia:** Pattern Recognition Letters

---

## 1. Resumen (Abstract)
Este artículo detalla la optimización del rastreo de vehículos bajo oclusiones parciales mediante la combinación de estimación lineal por Filtro de Kalman y asociación de datos por el Algoritmo Húngaro.

---

## 2. Metodología Propuesta
Modelado de cinemática lineal de velocidad constante. Predicción de la posición de la caja delimitadora en el siguiente frame y resolución de conflictos de asignación mediante el algoritmo Húngaro.

---

## 3. Resultados Obtenidos
Reducción de la pérdida de ID (ID switches) en un 40% en intersecciones con flujo vehicular denso.

---

## 4. Relación con Nuestro Proyecto
Fundamenta los modelos de interpolación cinemática lineal por fotogramas que implementamos para el taxi del demo.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
