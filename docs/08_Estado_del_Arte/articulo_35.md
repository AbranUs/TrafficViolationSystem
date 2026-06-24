# Estado del Arte - Artículo 35

## Información del Artículo
*   **Título:** Clasificación Automática de Peatones y Detección de Cruce Indebido
*   **Autores:** Santos, F. L., & Castro, R. J.
*   **Año de Publicación:** 2022
*   **Revista / Conferencia:** IET Intelligent Transport Systems

---

## 1. Resumen (Abstract)
Se propone un algoritmo para detectar peatones cruzando la pista fuera del paso de cebra o durante la luz verde vehicular, enviando alertas en tiempo real al sistema de control.

---

## 2. Metodología Propuesta
Detección de peatones con YOLOv8 complementada con análisis de máscara espacial de las líneas peatonales en la calzada.

---

## 3. Resultados Obtenidos
Tasa de detección del 92.5% en condiciones de luz diurna.

---

## 4. Relación con Nuestro Proyecto
Amplía el marco de reglas relacionales modeladas en las tablas de infracciones del proyecto.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
