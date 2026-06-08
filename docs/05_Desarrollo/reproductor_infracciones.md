# Monitoreo y Reproductor de Infracciones Sincronizado (Report)

Este documento detalla la especificación del reproductor multimedia inteligente y los algoritmos de sincronización bidireccional en tiempo real implementados en `frontend/src/pages/Report.jsx` y `frontend/src/pages/Report.css` para inspeccionar detalladamente los incidentes viales.

---

## 1. Arquitectura de Sincronización Bidireccional

Para facilitar que los operadores de tránsito puedan auditar los videos de forma interactiva, el sistema vincula la línea de tiempo del reproductor de video HTML5 nativo con el listado relacional de infracciones de forma bidireccional:

```text
               [ REPRODUCTOR VIDEO ] (onTimeUpdate)
                         │
                         ├─────────► Si currentTime == timestamp (± 2s)
                         │           1. Activar Bounding Box Overlay
                         │           2. Activar Banner Flotante Alerta IA
                         │           3. Resaltar Tarjeta Lateral con borde Neón
                         ▲
                         │ (seekTo onClick)
                         │
               [ TARJETAS SIDEBAR DE INFRACCIÓN ]
```

### A. Sincronización de Video a Lista (onTimeUpdate)
El reproductor de video nativo de HTML5 emite eventos periódicos de actualización de tiempo (`timeupdate`) unas 4 veces por segundo. El cliente React captura este evento mediante `onTimeUpdate={handleTimeUpdate}`:

1. Extrae el tiempo de reproducción actual en segundos:
   $$\text{tiempo\_reproduccion} = \text{videoRef.current.currentTime}$$
2. Filtra el arreglo de infracciones para identificar si existe un incidente registrado en esa ventana temporal ($\pm 2.0$ segundos):
   $$\text{infraccion\_activa} = \{ i \in \text{Infracciones} \mid \text{tiempo\_reproduccion} \ge i.\text{timestamp} \land \text{tiempo\_reproduccion} \le i.\text{timestamp} + 2.0 \}$$
3. Si existe, actualiza el estado `activeInfraction`. Esto gatilla de forma reactiva:
   * El resaltado neón perimetral de la tarjeta de la infracción en el panel lateral (`card-active-neon`).
   * El dibujado y la colocación de la capa flotante de detección sobre el reproductor.

### B. Sincronización de Lista a Video (seekTo)
Cada tarjeta de infracción en el panel lateral cuenta con un botón interactivo "Saltar a Incidente". Al hacer clic, se ejecuta una llamada directa al API del reproductor a través de su referencia `videoRef`:

```javascript
const seekTo = (timestamp) => {
  if (videoRef.current) {
    videoRef.current.currentTime = timestamp  // Avanza o retrocede al segundo exacto
    videoRef.current.play()                   // Asegura la reproducción
  }
}
```

---

## 2. Capa Flotante de Bounding Box (Canvas IA)

Una de las características más avanzadas es la capacidad de dibujar el recuadro neón de la IA sobre el reproductor responsivo sin alterar la relación de aspecto del video y compatible con cualquier tamaño de pantalla (móviles, tabletas, monitores 4K).

Esto se logra mediante **porcentajes relativos** calculados directamente sobre las coordenadas normalizadas ($0.0$ a $1.0$) de la caja delimitadora almacenada en PostgreSQL:

### A. Maquetación HTML / JSX
El reproductor de video y los overlays están envueltos en un contenedor principal con posicionamiento `position: relative`:

```html
<div className="media-container-relative">
  <video className="html5-video-player" ... />
  <div className="ai-bounding-box-overlay" style={bboxStyle}> ... </div>
</div>
```

### B. Mapeo de Estilos CSS Dinámicos
Los estilos de colocación de la caja neón flotante se calculan de la siguiente manera multiplicando las razones por 100:

```javascript
const bbox = activeInfraction.caja_delimitadora;
const bboxStyle = {
  left: `${bbox.x_min * 100}%`,
  top: `${bbox.y_min * 100}%`,
  width: `${(bbox.x_max - bbox.x_min) * 100}%`,
  height: `${(bbox.y_max - bbox.y_min) * 100}%`
}
```

### C. Estilos de Diseño Neón (`Report.css`)
El borde flotante tiene propiedades `pointer-events: none` para no obstruir los clicks del usuario sobre los controles de reproducción nativos del reproductor de video, y aplica una animación de parpadeo continuo en rojo brillante:

```css
.ai-bounding-box-overlay {
  position: absolute;
  border: 2px solid var(--accent-red);
  border-radius: 4px;
  box-shadow: 0 0 15px var(--accent-red);
  pointer-events: none;
  z-index: 10;
  box-sizing: border-box;
  animation: border-alert-pulse 0.5s infinite ease-in-out;
}
```

---

## 3. Miniaturas de Fotogramas de OpenCV (Evidencia Física)

El panel lateral carga directamente las imágenes físicas recortadas y pintadas por OpenCV en disco:

* **Patrón de URL**: `http://localhost:8000/uploads/frames/{infraccion_id}.jpg`
* **Visor Lightbox**: Al hacer clic en la miniatura de la tarjeta, se abre un modal de pantalla completa con efecto glassmorphic que despliega el frame en alta definición junto con todos los metadatos numéricos del incidente (Matrícula OCR, nivel de confianza exacto, y coordenadas físicas).
