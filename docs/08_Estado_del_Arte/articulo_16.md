# Estado del Arte - Artículo 16

## Información del Artículo
*   **Título:** Análisis del Flujo Vehicular y Detección de Congestión Mediante Flujo Óptico
*   **Autores:** Novak, J., & Dvorak, P.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Journal of Computing in Civil Engineering

---

## 1. Resumen (Abstract)
Se evalúa el algoritmo Lucas-Kanade de flujo óptico para medir la velocidad promedio de píxeles y estimar niveles de congestión sin necesidad de identificar vehículos individuales.

---

## 2. Metodología Propuesta
Cálculo de gradientes temporales e interpolación espacial sobre vectores de movimiento de fotogramas secuenciales.

---

## 3. Resultados Obtenidos
Detección exitosa de eventos de tráfico lento con un error promedio del 5% bajo condiciones de iluminación diurna.

---

## 4. Relación con Nuestro Proyecto
Complementa las bases de seguimiento cinemático de los objetos del sistema.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
