# Estado del Arte - Artículo 30

## Información del Artículo
*   **Título:** Evaluación Comparativa de Motores OCR (EasyOCR, Tesseract, PaddleOCR) para Matrículas
*   **Autores:** Liang, S., & Wu, Y.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Machine Vision and Applications

---

## 1. Resumen (Abstract)
Los autores comparan la tasa de acierto y los tiempos de latencia de tres populares librerías de reconocimiento de caracteres aplicadas a imágenes de matrículas recortadas de baja resolución.

---

## 2. Metodología Propuesta
Pruebas de reconocimiento sobre 5,000 imágenes bajo CPU estándar y GPU Nvidia. Medición de tiempos de ejecución y tasa de error de caracteres individuales.

---

## 3. Resultados Obtenidos
EasyOCR y PaddleOCR obtuvieron las mejores precisiones superando el 90%, aunque EasyOCR demostró mejor desempeño sin GPU con textos en español/inglés.

---

## 4. Relación con Nuestro Proyecto
Valida nuestra elección final de EasyOCR para el motor de reconocimiento de placas del backend.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
