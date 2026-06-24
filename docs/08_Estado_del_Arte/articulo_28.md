# Estado del Arte - Artículo 28

## Información del Artículo
*   **Título:** Estimación del Bounding Box 3D para Vehículos en Entornos Urbanos Monoculares
*   **Autores:** Luo, J., & Feng, Z.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Computer Graphics Forum

---

## 1. Resumen (Abstract)
Este estudio aborda la estimación de la orientación y dimensiones espaciales 3D de autos a partir de una única imagen 2D para análisis precisos de velocidad y volumen de vehículos.

---

## 2. Metodología Propuesta
Regresión lineal de dimensiones 3D y ángulo de guiñada (yaw) a partir de descriptores visuales 2D generados por la red YOLO.

---

## 3. Resultados Obtenidos
Precisión en la estimación del tamaño espacial del vehículo con un error promedio del 7.3%.

---

## 4. Relación con Nuestro Proyecto
Ofrece alternativas avanzadas para representaciones tridimensionales de evidencias viales en el sistema.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
