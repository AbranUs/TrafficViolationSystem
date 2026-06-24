# Estado del Arte - Artículo 21

## Información del Artículo
*   **Título:** Procesamiento y Despliegue de Inferencia de Video Headless en Servidores Linux
*   **Autores:** Clifford, A., & Sanders, L.
*   **Año de Publicación:** 2024
*   **Revista / Conferencia:** Systems and Software Journal

---

## 1. Resumen (Abstract)
Se propone un pipeline para ejecutar OpenCV y YOLOv8 en servidores sin interfaz gráfica (headless) sin provocar fugas de memoria o errores de inicialización gráfica de librerías nativas.

---

## 2. Metodología Propuesta
Configuración de dependencias headless y deshabilitación explícita de llamadas GUI (`cv2.imshow`, `cv2.waitKey`) delegando los resultados a transmisiones JSON y almacenamiento de archivos binarios.

---

## 3. Resultados Obtenidos
Se logra una ejecución continua libre de crashes por fallos del sistema gráfico nativo.

---

## 4. Relación con Nuestro Proyecto
Valida las correcciones de dependencias que realizamos para desplegar exitosamente en la nube de Render (OpenCV Headless).

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
