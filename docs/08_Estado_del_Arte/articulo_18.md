# Estado del Arte - Artículo 18

## Información del Artículo
*   **Título:** Redes Neuronales Recurrentes LSTM para el Reconocimiento de Caracteres en Placas
*   **Autores:** Miller, E., & Davis, S.
*   **Año de Publicación:** 2022
*   **Revista / Conferencia:** Pattern Recognition Letters

---

## 1. Resumen (Abstract)
Se detalla el uso de arquitecturas CNN-LSTM para leer placas vehiculares de forma secuencial, mejorando la coherencia contextual del texto sobre oclusiones parciales o distorsiones de la imagen.

---

## 2. Metodología Propuesta
Reducción dimensional por capas convolucionales y procesamiento temporal/secuencial con celdas bidireccionales LSTM.

---

## 3. Resultados Obtenidos
Precisión de lectura superior al 94.1% en placas cubiertas de lodo o con tipografía deteriorada.

---

## 4. Relación con Nuestro Proyecto
Respalda teóricamente el funcionamiento interno del motor de EasyOCR utilizado en rules.py.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
