# Estado del Arte - Artículo 23

## Información del Artículo
*   **Título:** Sistemas de Videovigilancia Vial Eficientes Basados en Salto Dinámico de Frames
*   **Autores:** Lopez, A., & Ruiz, P.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** ACM Transactions on Intelligent Systems

---

## 1. Resumen (Abstract)
Se estudia el impacto de procesar video saltando fotogramas de forma adaptativa según la velocidad del tráfico para optimizar la CPU en servidores compartidos.

---

## 2. Metodología Propuesta
Algoritmo de salto dinámico basado en vectores de velocidad promedio de los vehículos en escena.

---

## 3. Resultados Obtenidos
Ahorro de procesamiento de CPU de hasta 65% con una pérdida insignificante de precisión en la detección de infracciones del 1.5%.

---

## 4. Relación con Nuestro Proyecto
Fundamenta nuestra lógica de salto de frames implementada en ia_service.py para optimizar el rendimiento del servidor en Render.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
