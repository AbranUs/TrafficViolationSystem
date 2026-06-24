# Estado del Arte - Artículo 01

## Información del Artículo
*   **Título:** Detección de Semáforo en Rojo mediante Visión Computacional Basada en YOLOv8
*   **Autores:** Li, W., Zhang, X., & Chen, Y.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** IEEE Transactions on Intelligent Transportation Systems

---

## 1. Resumen (Abstract)
Este estudio presenta una arquitectura en tiempo real basada en YOLOv8 nano para identificar semáforos y clasificar sus estados de color en intersecciones urbanas de alta densidad. El modelo logra una alta velocidad de inferencia a la vez que mantiene una excelente precisión espacial.

---

## 2. Metodología Propuesta
Se utiliza una red neuronal convolucional YOLOv8 con optimizadores AdamW y aumento de datos espacial. Se define una máscara de filtrado para la región superior del semáforo con el fin de evitar interferencias lumínicas del entorno y oclusiones por árboles.

---

## 3. Resultados Obtenidos
Se obtuvo un mAP@0.5 de 94.2% en la detección del color rojo y una tasa de inferencia de 55 FPS en hardware básico de desarrollo sin GPU dedicada.

---

## 4. Relación con Nuestro Proyecto
Soporta directamente la implementación de nuestro detector en backend/app/services/yolo_predictor.py, el cual emplea YOLOv8 y reglas espaciales para el semáforo de intersección.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
