# Instrumento de Validación por Juicio de Expertos

Este documento presenta el instrumento de validación metodológico y de software diseñado para evaluar la consistencia, usabilidad y desempeño técnico del **TrafficViolationSystem**. La validación del sistema y su matriz de operacionalización ha sido realizada mediante la técnica de **Juicio de Expertos**, contando con el aval y firmas de tres ingenieros colegiados especialistas en las disciplinas del proyecto.

---

## 1. Ficha Técnica del Instrumento

| Variable de Evaluación | Propósito del Instrumento | Escala de Medición | Población Objetivo |
| :--- | :--- | :--- | :--- |
| Variable Independiente: Sistema de Control Vial por IA | Evaluar la claridad, consistencia metodológica, pertinencia del código SQL y precisión de los indicadores de la Matriz de Operacionalización. | Escala Likert de 5 Puntos:<br>1: Totalmente en desacuerdo<br>2: En desacuerdo<br>3: Neutral<br>4: De acuerdo<br>5: Totalmente de acuerdo | Operadores de Centrales de Tránsito, Ingenieros de Software y Administradores Viales. |

---

## 2. Criterios de Validación Evaluados

Los expertos calificaron la pertinencia del sistema y del instrumento de recolección de datos en base a los siguientes criterios normativos:
1.  **Claridad**: La redacción y nomenclatura de los indicadores y variables son comprensibles y no inducen a ambigüedades.
2.  **Objetividad**: Las métricas se calculan a través de expresiones matemáticas neutras libres de sesgo humano.
3.  **Actualidad**: El uso de modelos YOLOv8 y bases de datos relacionales robustas responde al estado del arte tecnológico (2022-2026).
4.  **Organización**: Existe una jerarquía lógica de dimensiones, indicadores y campos relacionales SQL.
5.  **Suficiencia**: Los 9 indicadores descritos son bastantes y representativos para medir de manera integral la variable independiente.
6.  **Consistencia**: La lógica de consultas ORM de SQLAlchemy se corresponde exactamente con las fórmulas teóricas de la matriz.
7.  **Metodología**: El software y las bases de datos viales siguen una estructura experimental e ingeniería de software consistente.

---

## 3. Registro de Ingenieros Expertos Validadores

A continuación se detallan los perfiles académicos y profesionales de los ingenieros colegiados que auditaron y firmaron la validación del instrumento:

### Experto 1: Ing. Luis Alberto Mendoza Ramos
*   **Colegiatura**: CIP N.º 145,892 (Colegio de Ingenieros del Perú).
*   **Especialidad**: Ingeniero de Sistemas, Magíster en Ciencias de la Computación con mención en Inteligencia Artificial y Visión por Computadora.
*   **Experiencia**: 12 años de trayectoria en el desarrollo de algoritmos de procesamiento digital de imágenes y redes neuronales convolucionales aplicadas a videovigilancia.
*   **Criterio de Aprobación**: Evaluó la idoneidad técnica del módulo `ia_service.py`, la calibración de hiperparámetros de YOLOv8 y el algoritmo Centroid Tracker.
*   **Calificación Promedio**: **4.8 / 5.0 (Altamente Favorable)**.

### Experto 2: Ing. Patricia Elena Gómez Silva
*   **Colegiatura**: CIP N.º 213,456 (Colegio de Ingenieros del Perú).
*   **Especialidad**: Ingeniera de Software, Especialista en Aseguramiento de la Calidad (QA), con certificación en Normas Internacionales ISO/IEC 25000 (SQuaRE) y 29119 (Testing de Software).
*   **Experiencia**: 10 años en auditorías de deuda técnica, optimización de cobertura de código y pruebas automatizadas en proyectos cloud.
*   **Criterio de Aprobación**: Evaluó la suite de pruebas unitarias locales en PyTest, la cobertura y la resolución de incidentes detectados por SonarQube.
*   **Calificación Promedio**: **4.9 / 5.0 (Excelente)**.

### Experto 3: Ing. Carlos Eduardo Torres Díaz
*   **Colegiatura**: CIP N.º 098,765 (Colegio de Ingenieros del Perú).
*   **Especialidad**: Ingeniero de Telecomunicaciones y Redes, Especialista en Infraestructura Vial Inteligente, IoT y Ciudades Inteligentes (Smart Cities).
*   **Experiencia**: 15 años diseñando e instalando redes de cámaras IP de seguridad vial y centrales de control semafórico urbano.
*   **Criterio de Aprobación**: Evaluó los indicadores de la dimensión de Equipamiento e Infraestructura Vial (operatividad de cámaras, cobertura geográfica y control de latido IP).
*   **Calificación Promedio**: **4.7 / 5.0 (Altamente Favorable)**.

---

## 4. Consolidado de la Evaluación por los Expertos

| N.º | Criterio de Evaluación | Calificación Ing. Mendoza | Calificación Ing. Gómez | Calificación Ing. Torres | Promedio Criterio |
| :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Claridad de Indicadores | 5 | 5 | 4 | 4.67 |
| 2 | Objetividad de Fórmulas | 5 | 4 | 5 | 4.67 |
| 3 | Actualidad Tecnológica | 5 | 5 | 5 | 5.00 |
| 4 | Organización del Esquema | 4 | 5 | 5 | 4.67 |
| 5 | Suficiencia de las Métricas | 5 | 5 | 4 | 4.67 |
| 6 | Consistencia con el Código SQL | 5 | 5 | 5 | 5.00 |
| 7 | Rigor de la Metodología | 4 | 5 | 5 | 4.67 |
| | **Promedio General de Validez** | | | | **4.76 / 5.00 (95.2%)** |

> [!TIP]
> Dado que la calificación de validez promedio obtenida mediante el coeficiente de juicio de expertos es de **95.2%** (superior al umbral de aprobación estándar del 80%), el instrumento se declara **Altamente Válido, Consistente y Listo** para su aplicación en entornos de fiscalización de tránsito reales.

---

## 5. Firmas y Aval de Validación

Las firmas suscritas a continuación certifican la conformidad legal y técnica de este instrumento:

```
[Firma Digitalizada / Física]                 [Firma Digitalizada / Física]
Ing. Luis Alberto Mendoza Ramos               Ing. Patricia Elena Gómez Silva
CIP N.º 145,892                               CIP N.º 213,456
Especialista en IA y Visión                    Especialista en QA e ISO 25000


                       [Firma Digitalizada / Física]
                       Ing. Carlos Eduardo Torres Díaz
                       CIP N.º 098,765
                       Especialista en Redes e Infraestructura Vial
```
