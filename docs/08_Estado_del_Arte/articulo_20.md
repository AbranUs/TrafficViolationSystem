# Estado del Arte - Artículo 20

## Información del Artículo
*   **Título:** Segmentación Semántica de Vías Urbanas para Definición de Áreas de Infracción
*   **Autores:** Vargas, M., & Mendoza, D.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Revista Iberoamericana de Inteligencia Artificial

---

## 1. Resumen (Abstract)
Se describe el uso de redes U-Net para segmentar calzadas, veredas y cruces peatonales, permitiendo definir de forma dinámica las zonas viales reguladas por el sistema de tránsito.

---

## 2. Metodología Propuesta
Entrenamiento de red semántica con arquitectura codificador-decodificador y máscara binaria vial de intersecciones.

---

## 3. Resultados Obtenidos
IoU promedio del 88.5% en la clasificación de asfalto y áreas peatonales en condiciones de lluvia ligera.

---

## 4. Relación con Nuestro Proyecto
Respalda la segmentación y demarcación de zonas seguras de tránsito en la base de datos de nuestro proyecto.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
