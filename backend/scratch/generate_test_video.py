import os
import cv2
import numpy as np

def generate_synthetic_video(output_path: str):
    """
    Genera un video sintético ligero (5 segundos, 30 FPS, 640x480) que contiene
    tres círculos oscuros moviéndose sobre un fondo claro, simulando las trayectorias
    físicas exactas que disparan las tres infracciones viales:
    1. Cruce de semáforo en rojo (cruce de línea horizontal durante el ciclo rojo).
    2. Giro en U (inversión vertical de trayectoria).
    3. Estacionamiento prohibido (permanecer inmóvil por más de 90 frames en zona designada).
    """
    print(f"[Generator] Iniciando generación de video sintético en: {output_path}")
    
    # Crear directorio si no existe
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    width, height = 640, 480
    fps = 30
    duration_sec = 5
    total_frames = fps * duration_sec  # 150 frames
    
    # Configurar el codec y el objeto VideoWriter (usamos mp4v para alta compatibilidad)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Coordenadas y trayectorias de los "vehículos" (círculos oscuros)
    # Vehículo 1 (Semáforo Rojo): Cruza y=336 en frame 85. El semáforo está rojo entre frames 60 y 120.
    v1_x = 520
    
    # Vehículo 2 (Giro en U): Baja de y=100 a y=360, luego sube a y=110. Inversión vertical.
    v2_positions = []
    for f in range(total_frames):
        if f < 60:
            # Bajando
            y = int(100 + (260 * f / 60))
            x = 350
        elif f < 90:
            # Curva de giro en U
            angle = np.pi * (f - 60) / 30  # Giro de 0 a 180 grados en radianes
            x = int(350 - 50 * np.sin(angle))
            y = int(360 - 20 * (1 - np.cos(angle)))
        else:
            # Subiendo
            y = int(340 - (230 * (f - 90) / 60))
            x = 300
        v2_positions.append((x, y))

    # Vehículo 3 (Estacionamiento Prohibido): Se detiene en (150, 350) - zona prohibida.
    # Zona Prohibida: X: 32 a 288, Y: 240 a 456
    v3_positions = []
    for f in range(total_frames):
        if f < 35:
            # Moviéndose hacia la zona
            x = int(50 + (100 * f / 35))
            y = int(150 + (200 * f / 35))
        else:
            # Detenido inmóvil por 115 frames (> 90 umbral)
            x = 150
            y = 350
        v3_positions.append((x, y))

    for f in range(total_frames):
        # 1. Crear fondo claro (gris muy claro para contraste binario)
        frame = np.ones((height, width, 3), dtype=np.uint8) * 240
        
        # Dibujar líneas de referencia visuales en el fotograma
        # Línea de parada del semáforo (y = 0.7 * 480 = 336)
        cv2.line(frame, (0, 336), (width, 336), (180, 180, 255), 2)
        cv2.putText(frame, "LINEA DE PARADA", (450, 325), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (100, 100, 255), 1)
        
        # Rectángulo de zona peatonal de parqueo prohibido
        # x: 32 a 288 (0.05 a 0.45), y: 240 a 456 (0.50 a 0.95)
        cv2.rectangle(frame, (32, 240), (288, 456), (255, 180, 180), 2)
        cv2.putText(frame, "ZONA PEATONAL PROHIBIDA", (40, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 100, 100), 1)
        
        # 2. Dibujar Vehículo 1 (Semáforo Rojo) - Solo activo en ciertos cuadros para cruzar
        if f < 130:
            # Mapeo de velocidad constante de arriba a abajo
            y1 = int(100 + (320 * f / 120))
            cv2.circle(frame, (v1_x, y1), 22, (10, 10, 10), -1)  # Círculo negro sólido
            cv2.putText(frame, "VEH_1", (v1_x - 20, y1 - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 50, 50), 1)
            
        # 3. Dibujar Vehículo 2 (Giro en U)
        x2, y2 = v2_positions[f]
        cv2.circle(frame, (x2, y2), 22, (15, 15, 15), -1)
        cv2.putText(frame, "VEH_2", (x2 - 20, y2 - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 50, 50), 1)
        
        # 4. Dibujar Vehículo 3 (Parqueo Prohibido)
        x3, y3 = v3_positions[f]
        cv2.circle(frame, (x3, y3), 22, (20, 20, 20), -1)
        cv2.putText(frame, "VEH_3", (x3 - 20, y3 - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (50, 50, 50), 1)

        # 5. Dibujar indicador de semáforo simulado (ciclo del timer: verde <= 45, amarillo <= 60, rojo <= 120)
        timer = (f + 1) % 121
        if timer <= 45:
            color = (100, 255, 100)  # Verde
            text = "VERDE"
        elif timer <= 60:
            color = (100, 255, 255)  # Amarillo
            text = "AMARILLO"
        else:
            color = (100, 100, 255)  # Rojo
            text = "ROJO"
            
        cv2.circle(frame, (50, 50), 15, color, -1)
        cv2.putText(frame, f"SEMAFORO: {text}", (80, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (50, 50, 50), 2)
        cv2.putText(frame, f"Frame: {f}/150", (80, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (120, 120, 120), 1)
        
        # Escribir frame al video
        out.write(frame)
        
    out.release()
    print(f"[Generator] ¡Video sintético creado exitosamente en {output_path}!")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_video = os.path.join(script_dir, "video_test_infracciones.mp4")
    generate_synthetic_video(output_video)
