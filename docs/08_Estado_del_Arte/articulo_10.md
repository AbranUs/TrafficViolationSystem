# Estado del Arte - Artículo 10

## Información del Artículo
*   **Título:** Preprocesamiento y Binarización Adaptativa para OCR de Matrículas con Ruido
*   **Autores:** Ruiz, A. H., & Morales, G. F.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Computación y Sistemas

---

## 1. Resumen (Abstract)
Se presenta un método de binarización local adaptativa y corrección de perspectiva para mejorar la precisión del reconocimiento óptico de caracteres en matrículas desgastadas o mal iluminadas.

---

## 2. Metodología Propuesta
Filtros Gaussianos, eliminación de ruido de fondo, ecualización CLAHE y detección de bordes Canny para aislar los caracteres antes del procesamiento del motor OCR.

---

## 3. Resultados Obtenidos
Mejora del 15% en la tasa de lectura correcta de matrículas capturadas bajo condiciones nocturnas.

---

## 4. Relación con Nuestro Proyecto
Respalda las rutinas de mejora de imagen implementadas en rules.py como el reajuste por interpolación y filtrado de caracteres.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
