# Estado del Arte - Artículo 12

## Información del Artículo
*   **Título:** Evaluación de YOLOv8 ante Condiciones Climáticas Adversas y Variación Estacional
*   **Autores:** Zhao, Y., & Wang, Q.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** IEEE Transactions on Vehicular Technology

---

## 1. Resumen (Abstract)
El estudio analiza la degradación del rendimiento de modelos YOLO entrenados con el dataset MS COCO al ser expuestos a videos grabados en climas lluviosos, nevados y con niebla densa.

---

## 2. Metodología Propuesta
Uso de aumentos sintéticos de lluvia y neblina. Ajuste fino de capas convolucionales y re-entrenamiento del modelo con pesos locales adaptados.

---

## 3. Resultados Obtenidos
Se mantuvo un mAP aceptable del 82.4% bajo condiciones climáticas simuladas extremas.

---

## 4. Relación con Nuestro Proyecto
Proporciona bases teóricas sobre la precisión esperada en el análisis en tiempo real en autopistas peruanas sujetas a neblina o garúa.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
