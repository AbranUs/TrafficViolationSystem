# Estado del Arte - Artículo 04

## Información del Artículo
*   **Título:** Estimación de Velocidad Vehicular en Tiempo Real sin Calibración Extrínseca de Cámara
*   **Autores:** Nguyen, H., & Tran, D. M.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Sensors Journal

---

## 1. Resumen (Abstract)
Este artículo aborda el cálculo de velocidad vehicular usando cámaras de vigilancia vial mediante homografía plana y vectores de movimiento sobre puntos de control predefinidos en la vía urbana.

---

## 2. Metodología Propuesta
Transformación de perspectiva a vista de pájaro mediante matriz de homografía. Seguimiento del vehículo y cálculo del tiempo de viaje entre dos líneas virtuales de control espaciadas a distancia conocida.

---

## 3. Resultados Obtenidos
Margen de error en la velocidad menor a 2.4 km/h frente a mediciones de radares doppler convencionales de tráfico.

---

## 4. Relación con Nuestro Proyecto
Se alinea con la lógica geométrica del sistema de cálculo de velocidades del sistema de tráfico y la estimación de infracciones por velocidad.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
