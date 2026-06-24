# Estado del Arte - Artículo 17

## Información del Artículo
*   **Título:** Detección de Cambios de Carril No Permitidos en Vías de Alta Velocidad
*   **Autores:** Sato, K., & Tanaka, H.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** IEEE Intelligent Transportation Systems Magazine

---

## 1. Resumen (Abstract)
Este estudio desarrolla un sistema de detección de infracciones por cruzar líneas continuas utilizando redes neuronales y visión espacial para el seguimiento lateral de vehículos.

---

## 2. Metodología Propuesta
Detección de líneas continuas viales con transformadas de Hough combinada con YOLO para verificar cruces o superposiciones de las cajas delimitadoras de autos.

---

## 3. Resultados Obtenidos
Tasa de detección del 95% en autopistas multicarril sin oclusiones severas.

---

## 4. Relación con Nuestro Proyecto
Alineado con el modelado de infracciones asociadas a carriles exclusivos de la base de datos relacional.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
