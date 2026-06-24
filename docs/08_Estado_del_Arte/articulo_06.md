# Estado del Arte - Artículo 06

## Información del Artículo
*   **Título:** Comparativa de Arquitecturas YOLOv5 y YOLOv8 para Clasificación en Tiempo Real de Tráfico
*   **Autores:** Martinez, C., & Santos, R.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** IEEE Access

---

## 1. Resumen (Abstract)
Se realiza un análisis exhaustivo del balance de precisión y velocidad de inferencia entre YOLOv5 y YOLOv8 en configuraciones nano, pequeña y mediana, evaluadas sobre datasets reales de autopistas.

---

## 2. Metodología Propuesta
Entrenamiento de ambas redes con los mismos hiperparámetros. Medición del mAP@0.5:0.95, consumo de memoria de video (VRAM), tiempo de latencia y estabilidad del modelo.

---

## 3. Resultados Obtenidos
YOLOv8 nano superó a YOLOv5 nano en 1.8% de mAP y redujo la latencia en un 12% en procesadores de gama baja de servidores compartidos.

---

## 4. Relación con Nuestro Proyecto
Valida nuestra elección final de la arquitectura YOLOv8 como motor de inferencia del TrafficViolationSystem por su óptima eficiencia en la nube de Render.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
