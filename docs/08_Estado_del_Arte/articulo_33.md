# Estado del Arte - Artículo 33

## Información del Artículo
*   **Título:** Clasificación de Estados Lumínicos de Semáforos por Histograma de Color y OpenCV
*   **Autores:** Hassan, M., & Rahman, F.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Computational Vision and Active Media Journal

---

## 1. Resumen (Abstract)
Se propone una técnica híbrida que detecta la caja del semáforo con redes neuronales y, mediante el análisis de componentes de color HSV en OpenCV, clasifica la luz activa (rojo, verde o amarillo).

---

## 2. Metodología Propuesta
Ubicación del semáforo por YOLO. Conversión del cuadro recortado a canal de color HSV y evaluación del histograma de brillo y saturación en los tres subcuadrantes del semáforo.

---

## 3. Resultados Obtenidos
Precisión del 99.1% bajo diferentes intensidades de luz diurna y nocturna.

---

## 4. Relación con Nuestro Proyecto
Valida nuestra lógica de tránsito que asocia la detección de la clase de semáforo con el estado de infracción.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
