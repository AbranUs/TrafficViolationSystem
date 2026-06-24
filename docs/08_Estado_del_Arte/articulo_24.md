# Estado del Arte - Artículo 24

## Información del Artículo
*   **Título:** Sistemas de Reconocimiento de Matrículas Multilenguaje Adaptables a Diversos Países
*   **Autores:** Hwang, S., & Park, K.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** International Journal of Vehicle Autonomous Systems

---

## 1. Resumen (Abstract)
Investigación sobre el uso de redes OCR entrenadas con caracteres multilenguaje para dar soporte a sistemas internacionales de tránsito sin necesidad de re-entrenamiento local.

---

## 2. Metodología Propuesta
Uso del lector EasyOCR con modelos lingüísticos combinados (español, inglés y caracteres numéricos).

---

## 3. Resultados Obtenidos
Tasa de precisión promedio de lectura de caracteres del 89.2% en matrículas americanas y latinoamericanas.

---

## 4. Relación con Nuestro Proyecto
Valida nuestra configuración multilenguaje en easyocr Reader para la lectura confiable de caracteres alfanuméricos.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
