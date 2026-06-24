# Estado del Arte - Artículo 22

## Información del Artículo
*   **Título:** Mecanismos de Interpolación Temporal para Mitigación de Oclusiones en Cámaras de Tránsito
*   **Autores:** Gao, H., & Zhou, M.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** IEEE Transactions on Image Processing

---

## 1. Resumen (Abstract)
Los autores evalúan algoritmos de estimación de trayectorias físicas para reconstruir las cajas delimitadoras de vehículos cuando son bloqueados temporalmente por postes viales o árboles.

---

## 2. Metodología Propuesta
Uso de keyframes anteriores y posteriores para aplicar interpolaciones lineales y polinómicas, estimando la ubicación espacial del vehículo ocluido.

---

## 3. Resultados Obtenidos
Precisión de estimación del bounding box del 91.2% durante oclusiones que duren hasta 20 fotogramas continuos.

---

## 4. Relación con Nuestro Proyecto
Soporta la lógica matemática detrás de la interpolación de trayectorias por fotogramas que implementamos para el taxi blanco en el yolo_predictor.py.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
