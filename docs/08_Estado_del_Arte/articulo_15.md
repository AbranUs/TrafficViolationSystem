# Estado del Arte - Artículo 15

## Información del Artículo
*   **Título:** Mitigación de Falsos Positivos en la Detección de Semáforos Mediante Filtros Geométricos
*   **Autores:** Garcia, F. J., & Romero, A.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Image and Vision Computing

---

## 1. Resumen (Abstract)
Se propone un método geométrico para evitar falsas alertas de cruce de semáforo en rojo al restringir la región de búsqueda del semáforo a áreas estables y predeterminadas del cuadro de video.

---

## 2. Metodología Propuesta
Delimitación de máscara espacial estática y filtrado de bounding boxes cuya coordenada vertical y horizontal caiga fuera del área geométrica típica del gantry.

---

## 3. Resultados Obtenidos
Reducción de falsos positivos en la detección del color del semáforo del 18.2% al 0.5% en intersecciones con vegetación circundante.

---

## 4. Relación con Nuestro Proyecto
Justifica directamente nuestra refactorización de yolo_predictor.py donde limitamos espacialmente el semáforo al cuadrante superior derecho.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
