# Estado del Arte - Artículo 03

## Información del Artículo
*   **Título:** Seguimiento de Vehículos en Cámaras Viales mediante Rastreo por Centroides
*   **Autores:** Patel, R. K., & Sharma, A. P.
*   **Año de Publicación:** 2022
*   **Revista / Conferencia:** Journal of Real-Time Image Processing

---

## 1. Resumen (Abstract)
Se propone un algoritmo de seguimiento de centroides ligero y de baja latencia para el conteo y rastreo de vehículos en entornos urbanos. El método asocia las detecciones de un frame al siguiente usando distancia euclidiana y lógica de desaparición temporal.

---

## 2. Metodología Propuesta
Calcula el centro geométrico de los cuadros delimitadores detectados. Realiza la asociación de IDs basada en una matriz de distancias y define un umbral de fotogramas máximos permitidos para registrar la salida del objeto de la escena.

---

## 3. Resultados Obtenidos
Precisión de asociación de ID del 98.6% en flujos de tráfico estables y un consumo de CPU insignificante de menos del 2% del procesador local.

---

## 4. Relación con Nuestro Proyecto
Proporciona la fundamentación matemática para el CentroidTracker que implementamos en nuestro sistema de backend para seguir a los infractores.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
