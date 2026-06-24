# Diseño del Sistema de Interfaz (UX/UI) y Mockups Reales

Este documento detalla la arquitectura de información, los principios de diseño de experiencia de usuario (UX) e interfaz visual (UI), y presenta los **mockups reales** de la aplicación web del **TrafficViolationSystem**.

---

## 1. Lineamientos del Sistema de Diseño (Aesthetics System)

Para proveer una experiencia premium digna de centrales de control vial de última generación, la interfaz fue desarrollada bajo los siguientes estándares de diseño:
*   **Modo Oscuro Predeterminado**: Reduce la fatiga visual de los operadores que supervisan pantallas durante turnos prolongados de 8 o 12 horas.
*   **Paleta de Colores HSL Tailored**: Se definen colores base en formato HSL para lograr contrastes limpios y armónicos.
    *   *Fondo General*: Slate Dark (`#0f172a`).
    *   *Tarjetas e Hilos*: Glassmorphism (paneles traslúcidos con bordes delgados de un pixel, difuminados de fondo y gradientes en tonos índigo/violeta).
    *   *Estados y Detecciones*: Colores de neón de alta visibilidad:
        *   Cruce en Rojo / Alertas: Rojo Neón (`#ef4444` / `rgba(239, 68, 68, 0.2)`).
        *   Giro en U / Movimiento: Violeta/Cian Neón (`#06b6d4` y `#a855f7`).
        *   Camaras / Agentes / Éxito: Verde Neón (`#10b981`).
*   **Tipografía Moderna**: Uso de fuentes sans-serif dinámicas de Google Fonts (Inter / Outfit) con jerarquías de peso visual estrictas para agilizar la lectura de datos numéricos (como matrículas OCR y confianzas).
*   **Micro-animaciones CSS**: Transiciones suaves (`transition: all 0.3s ease`) en botones, tarjetas de infracción e interactividad de la barra de navegación para mejorar la percepción del rendimiento de la interfaz.

---

## 2. Flujos Visuales del Cliente (Páginas y Componentes)

### A. dropzone de Carga Masiva (`UploadVideo.jsx`)
*   **Diseño**: Área de arrastrar y soltar archivos interactiva. Al arrastrar un archivo, los bordes punteados se iluminan con un gradiente neón.
*   **Espera Dinámica (Semáforo de IA)**: Al iniciar el análisis, la dropzone se oculta y renderiza un elemento gráfico de semáforo tricolor interactivo. El semáforo simula las fases de luces (rojo $\rightarrow$ amarillo $\rightarrow$ verde) de forma continua mientras el backend FastAPI procesa el video en segundo plano, evitando que el usuario perciba el sistema como colgado.

### B. Reproductor Interactivo Bidireccional (`Report.jsx`)
*   **Recuadros Neón Flotantes**: Mediante el evento de actualización de tiempo (`timeupdate`) del elemento HTML5 `<video>`, el frontend posiciona de forma dinámica cajas flotantes neón sobre el contenedor de video en las coordenadas exactas de la infracción en ese segundo.
*   **Navegación Interactiva**: Permite saltar al segundo exacto de la infracción haciendo clic en "Saltar a Incidente", lo que sincroniza automáticamente la línea de tiempo del reproductor.

### C. Dashboard Analítico (`Analytics.jsx`)
*   **KPI Cards**: Tarjetas translúcidas que resumen los agregados SQL clave con iconos vectoriales de Lucide-React.
*   **Gráficos Integrados**: Muestran tendencias cronológicas e infracciones agrupadas.

---

## 3. Mockups Reales de la Interfaz del Sistema

A continuación se presentan los mockups reales capturados directamente del entorno de desarrollo de la plataforma, que evidencian el diseño premium implementado:

### Mockup 1: Dashboard de Analíticas Viales y Tendencias
Muestra el panel de control administrativo consolidando los agregados de videos, confianza promedio del motor de IA y el historial cronológico de infracciones.

![Dashboard de Analíticas Viales](file:///c:/TrafficViolationSystem/docs/04_Arquitectura/mockups/dashboard_panel_analitico.png)

---

### Mockup 2: Ficha Técnica de Evidencia y Detalle Modal (Boleta)
Muestra la modal interactiva con el frame JPG procesado por OpenCV donde **se dibuja un rectángulo de color rojo sólido** encerrando la infracción, la matrícula leída por OCR, los datos de identidad ciudadana resueltos y los montos y puntos de la multa.

![Ficha de Infracción y Evidencia Modal](file:///c:/TrafficViolationSystem/docs/04_Arquitectura/mockups/evidence_modal.png)

---

### Mockup 3: Historial de Infracciones y Configuración de Precios
Muestra la interfaz interactiva con el listado de las infracciones procesadas en el sistema, permitiendo al operador auditar rápidamente y verificar los montos de multas parametrizados.

![Historial de Infracciones y Precios](file:///c:/TrafficViolationSystem/docs/04_Arquitectura/mockups/history_updated_prices.png)
