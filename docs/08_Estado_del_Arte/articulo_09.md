# Estado del Arte - Artículo 09

## Información del Artículo
*   **Título:** Detección de Estacionamiento Indebido en Vías Públicas usando Visión Artificial
*   **Autores:** Brown, T., & Green, P.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Computer Vision and Image Understanding

---

## 1. Resumen (Abstract)
Se propone un sistema autónomo para detectar vehículos estacionados en zonas de carga/descarga o paraderos de autobús mediante el análisis continuo de permanencia temporal en áreas delimitadas.

---

## 2. Metodología Propuesta
Definición de regiones de interés (ROI). Monitoreo de la permanencia del ID del vehículo estacionado por un intervalo de tiempo configurable superior a 120 segundos.

---

## 3. Resultados Obtenidos
Tasa de detección exitosa del 97% con falsos positivos mitigados gracias al análisis de dirección y detención total del objeto.

---

## 4. Relación con Nuestro Proyecto
Relacionado con la lógica de detección de estacionamientos indebidos en las zonas de paraderos de la base de datos.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
