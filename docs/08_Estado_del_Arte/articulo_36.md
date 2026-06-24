# Estado del Arte - Artículo 36

## Información del Artículo
*   **Título:** Aprendizaje Federado para Entrenamiento Distribuido de Modelos de Tránsito
*   **Autores:** Duffy, J., & Higgins, C.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** IEEE Transactions on Mobile Computing

---

## 1. Resumen (Abstract)
Se evalúa el uso de aprendizaje federado para entrenar el modelo de detección vial YOLO en cámaras distribuidas en la ciudad sin transferir datos de video privados a un servidor central.

---

## 2. Metodología Propuesta
Entrenamiento local de pesos en cada dispositivo edge y agregación periódica centralizada de pesos mediante algoritmo Federated Averaging.

---

## 3. Resultados Obtenidos
Precisión comparable al entrenamiento centralizado (91% de mAP) reduciendo en un 95% la transmisión de datos por red de telecomunicación vial.

---

## 4. Relación con Nuestro Proyecto
Aporta una perspectiva de escalabilidad futura para el sistema de tránsito inteligente.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
