# Estado del Arte - Artículo 27

## Información del Artículo
*   **Título:** Rastreo de Vehículos en Alta Densidad Vehicular con DeepSORT y Embeddings de Apariencia
*   **Autores:** Zhao, L., & Hu, Y.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** IEEE Transactions on Intelligent Vehicles

---

## 1. Resumen (Abstract)
Se presenta el algoritmo DeepSORT modificado para el rastreo robusto de autos en autopistas congestionadas mediante la combinación de distancias de intersección sobre unión (IoU) y descriptores de apariencia profunda.

---

## 2. Metodología Propuesta
Extracción de vectores de apariencia (embeddings) del auto y asociación húngara ponderada con las predicciones del filtro de Kalman.

---

## 3. Resultados Obtenidos
Disminución sustancial de los saltos de ID bajo oclusiones largas y cruzamientos de carriles.

---

## 4. Relación con Nuestro Proyecto
Establece bases avanzadas para futuros refinamientos del módulo de tracking del TrafficViolationSystem.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
