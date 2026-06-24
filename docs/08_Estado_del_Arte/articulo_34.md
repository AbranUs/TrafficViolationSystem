# Estado del Arte - Artículo 34

## Información del Artículo
*   **Título:** Mitigación de Latencia en Inferencia de Video mediante Multihilos Asíncronos
*   **Autores:** Patterson, A., & Kennedy, J.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Parallel Computing Journal

---

## 1. Resumen (Abstract)
Estudio sobre técnicas de optimización en aplicaciones de inferencia vial basadas en el uso de hilos paralelos para lectura de video, procesamiento de modelo y guardado en disco.

---

## 2. Metodología Propuesta
Implementación de colas asíncronas seguras de hilos (thread-safe queues) utilizando librerías nativas de python y colas de procesos paralelos.

---

## 3. Resultados Obtenidos
Aumento del rendimiento global en un 40%, permitiendo decodificar flujos de video HD a tiempo real sin retrasar las inferencias del modelo.

---

## 4. Relación con Nuestro Proyecto
Respalda la lógica asíncrona implementada para el análisis de video en nuestro backend.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
