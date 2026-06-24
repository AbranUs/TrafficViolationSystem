# Caso de Negocio y Retorno de la Inversión (ROI)
## Proyecto: Sistema de Control y Detección de Infracciones de Tránsito mediante Inteligencia Artificial (TrafficViolationSystem)

---

## 1. Resumen Ejecutivo

El despliegue de tecnología de control vial mediante Inteligencia Artificial representa no solo un avance en seguridad ciudadana y ordenamiento urbano, sino también una decisión económicamente rentable para los gobiernos locales. El **TrafficViolationSystem** automatiza el proceso de fiscalización vial, minimizando la necesidad de agentes de tránsito físicos en puntos críticos y maximizando la tasa de detección oportuna de infracciones vehiculares.

El presente documento analiza la viabilidad económica y financiera del sistema. El estudio demuestra que la inversión inicial de capital (**CAPEX**) se recupera ampliamente en el primer año de operación debido al incremento de la efectividad en la recaudación de multas, la optimización de los recursos de fiscalización y, fundamentalmente, la reducción de los costos sociales derivados de los accidentes de tránsito.

---

## 2. Análisis del Costo de Implementación (Estructura CAPEX y OPEX)

Para evaluar la rentabilidad del proyecto en un horizonte de 3 años, se ha consolidado el presupuesto detallado de inversión inicial y costos de operación recurrente.

### A. Inversión Inicial (CAPEX)
Corresponde a todos los gastos de adquisición de licencias, desarrollo, calibración inicial e infraestructura física de arranque:

| ID | Concepto de Inversión | Descripción | Costo (USD) |
| :--- | :--- | :--- | :--- |
| **C-01** | Desarrollo y Customización de Software | Adaptación del backend FastAPI y la SPA React, e integraciones con las bases de datos viales y pasarelas de pago del cliente. | $15,000.00 |
| **C-02** | Hardware e Servidores Locales GPU | Adquisición de servidores locales con soporte de aceleración CUDA de NVIDIA para inferencia offline y de backup. | $8,500.00 |
| **C-03** | Calibración de Redes y Pruebas IA | Entrenamiento y etiquetado de imágenes de la red YOLOv8 con el parque automotor de la ciudad. | $4,500.00 |
| **C-04** | Capacitación e Implementación | Talleres prácticos para operadores de videovigilancia y oficiales encargados de la aprobación legal de boletas. | $2,000.00 |
| **C-05** | Contingencias | Reserva del 10% para imprevistos en desarrollo o fallas de red iniciales. | $3,000.00 |
| **Total** | **Inversión Inicial CAPEX** | | **$33,000.00** |

### B. Gastos Operativos Recurrentes (OPEX)
Corresponde a los gastos de mantenimiento y hosting anuales a partir del Año 1:

| ID | Concepto de Gasto Operativo | Periodicidad | Costo Anual (USD) |
| :--- | :--- | :--- | :--- |
| **O-01** | Hosting Cloud y Base de Datos | Mensual | $2,400.00 |
| **O-02** | Soporte Técnico y Mantenimiento SLA | Trimestral | $3,600.00 |
| **O-03** | Actualización de Modelos de IA | Anual | $1,500.00 |
| **O-04** | Licencias de Software de Terceros | Anual | $500.00 |
| **Total** | **Gasto OPEX Anual** | | **$8,000.00** |

---

## 3. Beneficios Cuantitativos e Incremento de Recaudación

La viabilidad del caso de negocio descansa en la optimización de los flujos de trabajo e ingresos viales:
1. **Detección Continua (24/7)**: A diferencia de la fiscalización humana, el sistema de IA no experimenta fatiga ni distracciones. Monitorea las 24 horas del día. Se proyecta que una sola cámara IP vial en una intersección crítica detecta un promedio de **15 infracciones válidas diarias**.
2. **Efectividad de Recaudación**: Con una multa promedio de **$80.00 USD** por infracciones de cruce en rojo o giro prohibido, y estimando una tasa de cobro efectiva del **65%** (debido a la inmutabilidad de la evidencia fotográfica provista por el frame JPG con el rectángulo de color rojo sólido dibujado por OpenCV), el sistema genera un flujo constante de ingresos:
   $$\text{Ingreso Mensual por Cámara} = 15 \text{ multas/día} \times 30 \text{ días} \times 80.00 \text{ USD} \times 0.65 = 23,400.00 \text{ USD}$$
3. Para fines de este análisis y manteniendo una postura de proyección conservadora, estimamos un escenario donde implementamos el sistema en **10 cámaras viales** críticas en el distrito, y proyectamos los ingresos reales netos ajustados por incobrables y beneficios de pronto pago.

---

## 4. Proyección Financiera a 3 Años (Flujo de Caja)

A continuación, se detalla el Flujo de Caja proyectado a 3 años considerando la inversión inicial CAPEX en el Año 0, los costos de mantenimiento OPEX anuales y los ingresos por recaudación vial optimizada:

| Concepto | Año 0 | Año 1 | Año 2 | Año 3 |
| :--- | :---: | :---: | :---: | :---: |
| **Inversión Inicial (CAPEX)** | -$33,000.00 | - | - | - |
| **Ingresos por Recaudación Vial** | - | $120,000.00 | $150,000.00 | $180,000.00 |
| **Costos de Operación (OPEX)** | - | -$8,000.00 | -$8,500.00 | -$9,000.00 |
| **Flujo de Caja Neto** | **-$33,000.00** | **$112,000.00** | **$141,500.00** | **$171,000.00** |
| **Flujo Acumulado** | **-$33,000.00** | **$79,000.00** | **$220,500.00** | **$391,500.00** |

---

## 5. Indicadores Financieros de Rentabilidad (ROI, VAN, TIR)

Para certificar la conveniencia del proyecto, aplicamos las métricas financieras estándares utilizando una tasa de descuento social recomendada del **10%** anual.

### A. Valor Actual Neto (VAN)
El VAN calcula el valor actual de los flujos de dinero proyectados en el tiempo menos la inversión inicial:
$$\text{VAN} = -I_0 + \sum_{t=1}^{n} \frac{FC_t}{(1 + r)^t}$$
$$\text{VAN} = -33,000 + \frac{112,000}{(1.1)^1} + \frac{141,500}{(1.1)^2} + \frac{171,000}{(1.1)^3}$$
$$\text{VAN} = -33,000 + 101,818.18 + 116,942.15 + 128,474.83 = 314,235.16 \text{ USD}$$
* **Resultado**: Dado que el **VAN ($314,235.16 USD) > 0**, el proyecto es altamente rentable y genera un valor sustancial para la institución desde el primer año.

### B. Tasa Interna de Retorno (TIR)
La TIR representa la tasa de descuento que hace que el VAN sea igual a cero.
* **Resultado**: Al resolver la ecuación del polinomio financiero, la **TIR es superior al 280%**. Esto indica que el proyecto tolera incrementos significativos en la tasa de interés o desviaciones extremas de costos sin dejar de ser económicamente factible.

### C. Retorno de la Inversión (ROI)
El ROI mide la relación entre la ganancia obtenida y la inversión requerida:
$$\text{ROI} = \frac{\text{Beneficio Neto Acumulado}}{\text{Inversión Total}}$$
* Al final del **Año 1**:
  $$\text{ROI} = \frac{112,000.00 - 8,000.00 - 33,000.00}{33,000.00} = 2.15 \rightarrow 215\%$$
* Al final del **Año 3** (Consolidado):
  $$\text{ROI Acumulado} = \frac{391,500.00}{33,000.00} = 11.86 \rightarrow 1186\%$$
* **Resultado**: Por cada dólar invertido en el proyecto al inicio, la municipalidad recupera el dólar de inversión y obtiene un beneficio neto de **$2.15 USD en el primer año** y **$11.86 USD acumulado a los 3 años**.

### D. Período de Recupero de la Inversión (Payback)
* Debido a que el flujo de caja neto del primer año ($112,000.00 USD) supera ampliamente la inversión inicial ($33,000.00 USD), el punto de equilibrio financiero se alcanza en los primeros **3.5 meses** de operación comercial.

---

## 6. Costos Sociales Evitados (Beneficio Social Indirecto)

Además del retorno financiero directo por cobro de multas viales, el proyecto genera ahorros significativos en los presupuestos públicos por "costos evitados de siniestralidad":
* **Salud Pública**: Menor ocupación de camas de hospital y unidades de cuidados intensivos debido a heridos graves en accidentes de tránsito.
* **Productividad**: Reducción de las pérdidas de horas de trabajo productivas por incapacidades temporales o permanentes de conductores y peatones.
* **Infraestructura**: Menor gasto en reparaciones de semáforos, postes de alumbrado público, guardavías y pistas dañados por colisiones vehiculares.

Estimaciones de la Organización Mundial de la Salud (OMS) sugieren que un accidente grave de tránsito le cuesta al estado un promedio de **$15,000.00 USD** en atención e infraestructura. Al reducir los incidentes viales en intersecciones críticas en al menos un 35% mediante el control disuasorio del **TrafficViolationSystem**, se evitan pérdidas indirectas estimadas en **$105,000.00 USD anuales** para el municipio.

---

## 7. Conclusión de Viabilidad

La evaluación financiera de la plataforma **TrafficViolationSystem** concluye que la implementación del sistema es **técnica, social y económicamente viable**. El proyecto presenta un retorno de inversión excepcionalmente rápido, un VAN altamente positivo y tasas de retorno que superan con creces el costo de capital de cualquier entidad de desarrollo gubernamental o privado. Se recomienda proceder inmediatamente con el desembolso presupuestal de la Fase de Ejecución e Integración.
