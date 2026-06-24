# Estado del Arte - Artículo 26

## Información del Artículo
*   **Título:** Identificación de Vehículos de Emergencia para Priorización en Cruces Semafóricos
*   **Autores:** Turner, N., & Collins, R.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Transportation Research Part C

---

## 1. Resumen (Abstract)
Los autores proponen un sistema inteligente que detecta ambulancias, camiones de bomberos y patrullas mediante YOLO y sonido de sirenas para abrir el semáforo automáticamente.

---

## 2. Metodología Propuesta
Modelo YOLOv8 para detección visual de leyendas y colores distintivos complementado con espectrogramas de audio para reconocimiento acústico de sirenas.

---

## 3. Resultados Obtenidos
Precisión de clasificación de vehículos de emergencia del 98% a distancias superiores a 80 metros de la intersección.

---

## 4. Relación con Nuestro Proyecto
Relacionado directamente con la clasificación fina de vehículos requerida en el sistema de gestión analítica del proyecto.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
