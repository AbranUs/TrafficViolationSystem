# Estado del Arte - Artículo 13

## Información del Artículo
*   **Título:** Detección de Motociclistas sin Casco utilizando Redes Convolucionales YOLO
*   **Autores:** Castro, L. A., & Ortega, M. E.
*   **Año de Publicación:** 2022
*   **Revista / Conferencia:** Information Fusion Journal

---

## 1. Resumen (Abstract)
Se propone un clasificador en cascada que detecta motocicletas y, mediante un zoom digital enfocado en la región del conductor, verifica la presencia o ausencia de casco de seguridad.

---

## 2. Metodología Propuesta
Detección YOLO multiclase para ubicar la motocicleta. Recorte del área de la cabeza del conductor e inferencia con una sub-red CNN de clasificación binaria (con casco / sin casco).

---

## 3. Resultados Obtenidos
Precisión de detección de no uso de casco del 93.4% en vías de velocidad moderada.

---

## 4. Relación con Nuestro Proyecto
Relacionado directamente con la ampliación de infracciones multiclase contempladas en la base de datos del proyecto.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
