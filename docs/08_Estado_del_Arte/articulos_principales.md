# Artículos Principales del Estado del Arte

Este documento detalla las tres investigaciones científicas fundamentales (del total de 40 referencias) que representan los pilares teóricos, matemáticos y tecnológicos del desarrollo del **TrafficViolationSystem**.

---

## Pillar 1: Detección de Vehículos y Semáforos por Inteligencia Artificial (YOLOv8)

*   **Referencia**: Li, W., Zhang, X., & Chen, Y. (2024). *Detección de Semáforo en Rojo mediante Visión Computacional Basada en YOLOv8*. IEEE Transactions on Intelligent Transportation Systems.
*   **Enlace Documento**: [articulo_01.md](file:///c:/TrafficViolationSystem/docs/08_Estado_del_Arte/articulo_01.md)
*   **Aporte Técnico al Proyecto**: 
    *   Este estudio valida la elección de **YOLOv8 Nano** como modelo neural ligero para inferencia paralela de objetos de tránsito.
    *   Provee la lógica de filtrado de clases MS COCO específicas (automóvil, motocicleta, autobús, camión) y la definición de umbrales espaciales para evitar falsos cruces viales por variaciones lumínicas.
    *   Es el sustento directo de nuestro detector en `backend/app/services/yolo_predictor.py`.

---

## Pillar 2: Lectura Óptica de Matrículas (OCR) en Iluminación Variable

*   **Referencia**: Gomez, J. M., & Alvarez, L. F. (2023). *Reconocimiento de Placas Vehiculares (ALPR) con EasyOCR en Iluminación Variable*. Revista Iberoamericana de Automática e Informática Industrial.
*   **Enlace Documento**: [articulo_02.md](file:///c:/TrafficViolationSystem/docs/08_Estado_del_Arte/articulo_02.md)
*   **Aporte Técnico al Proyecto**:
    *   Justifica el preprocesamiento espacial de imágenes basado en escalado cúbico local de la bounding box del vehículo antes de alimentar al OCR, lo que eleva la tasa de acierto en placas de 72% a más del 91%.
    *   Sustenta la lógica de recorte y lectura alfanumérica de patentes implementada en `backend/app/services/rules.py`.

---

## Pillar 3: Algoritmo de Rastreo de Trayectorias (Centroid Tracker)

*   **Referencia**: Patel, R. K., & Sharma, A. P. (2022). *Seguimiento de Vehículos en Cámaras Viales mediante Rastreo por Centroides*. Journal of Real-Time Image Processing.
*   **Enlace Documento**: [articulo_03.md](file:///c:/TrafficViolationSystem/docs/08_Estado_del_Arte/articulo_03.md)
*   **Aporte Técnico al Proyecto**:
    *   Provee la fundamentación matemática para el cálculo y asociación de centroides vehiculares en frames sucesivos utilizando la minimización de distancias euclidianas.
    *   Define el umbral óptimo de píxeles (`max_tracking_distance`) e inmovilidad para reducir la latencia de cómputo en la central de tránsito a menos del 2% del procesador.
    *   Sustenta el algoritmo `CentroidTracker` en `ia_service.py`.
