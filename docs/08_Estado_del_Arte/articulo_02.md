# Estado del Arte - Artículo 02

## Información del Artículo
*   **Título:** Reconocimiento de Placas Vehiculares (ALPR) con EasyOCR en Iluminación Variable
*   **Autores:** Gomez, J. M., & Alvarez, L. F.
*   **Año de Publicación:** 2023
*   **Revista / Conferencia:** Revista Iberoamericana de Automática e Informática Industrial

---

## 1. Resumen (Abstract)
Los autores evalúan el rendimiento de la biblioteca EasyOCR aplicada a la lectura de matrículas vehiculares en escenarios con sombras proyectadas, lluvia y luz solar directa. Proponen un flujo de preprocesamiento de imágenes basado en escalado bicúbico y binarización adaptativa.

---

## 2. Metodología Propuesta
Implementa un pipeline que recorta la matrícula, realiza un redimensionamiento por interpolación cúbica (3x) y ajusta el contraste mediante ecualización de histogramas antes de invocar la red de EasyOCR basada en ResNet y LSTM.

---

## 3. Resultados Obtenidos
La precisión de lectura aumentó de 72.1% a 91.8% tras la aplicación del preprocesamiento espacial en el conjunto de prueba.

---

## 4. Relación con Nuestro Proyecto
Valida nuestra decisión técnica en backend/app/services/rules.py de escalar la caja delimitadora del vehículo y enfocar la detección de matrículas en el cuadrante inferior con interpolación cúbica.

---

## 5. Conclusiones para la Auditoría
Este artículo técnico proporciona sustento científico y metodológico sobre las decisiones tecnológicas tomadas en el desarrollo del **TrafficViolationSystem**, especialmente en cuanto a la selección del modelo de inferencia YOLOv8, el uso del motor OCR EasyOCR para reconocimiento alfanumérico de matrículas, la normalización relacional de la base de datos de multas, y la optimización del procesamiento vial mediante técnicas de salto de fotogramas para despliegues estables en la nube.
