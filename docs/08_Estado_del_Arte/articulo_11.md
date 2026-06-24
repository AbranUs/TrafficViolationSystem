# Estado del Arte - Artículo 11

## Información del Artículo
*   **Título:** Optimización del Consumo de CPU y RAM en Modelos de Visión Artificial en la Nube
*   **Autores:** Fisher, J., & Jenkins, M.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Software: Practice and Experience

---

## 1. Resumen (Abstract)
Este estudio evalúa técnicas para desplegar modelos YOLOv8 y similares en servidores en la nube con recursos extremadamente limitados (como instancias de 512MB de RAM), enfocándose en la recolección de basura agresiva y el salto de fotogramas.

---

## 2. Metodología Propuesta
Reducción de frames, eliminación manual de variables de tensores de PyTorch, configuración del recolector de basura de python y retraso en la carga del modelo en memoria.

---

## 3. Resultados Obtenidos
Disminución del uso de RAM de 1.2GB a solo 380MB, permitiendo ejecutar inferencias en contenedores compartidos sin provocar desbordamientos.

---

## 4. Relación con Nuestro Proyecto
Justifica las optimizaciones críticas del backend de nuestro proyecto para el entorno productivo de Render (frame skipping y desactivación de YOLO).

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
