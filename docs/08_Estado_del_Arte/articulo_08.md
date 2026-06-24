# Estado del Arte - Artículo 08

## Información del Artículo
*   **Título:** Clasificación Multiclase de Vehículos en Entornos Inteligentes Urbanos
*   **Autores:** Silva, A., & Souza, F.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Applied Intelligence Journal

---

## 1. Resumen (Abstract)
Los autores proponen un modelo especializado en la clasificación de vehículos (motocicletas, autos, taxis, camiones) para mejorar los reportes de flujos de tráfico y adecuar las multas según el tipo de transporte.

---

## 2. Metodología Propuesta
Red convolucional basada en YOLO con una capa adicional de clasificación multiclase. Filtrado selectivo de etiquetas específicas COCO.

---

## 3. Resultados Obtenidos
Precisión de clasificación multiclase de 92.5%, logrando discriminar efectivamente taxis de vehículos particulares por color y letrero.

---

## 4. Relación con Nuestro Proyecto
Soporta la lógica de asignación y categorización de multas del backend del proyecto según el tipo de transporte (ej: taxi blanco).

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
