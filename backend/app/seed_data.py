import os
import sys
import datetime
import uuid
import random
import logging

# Agregar el directorio raíz al path de Python si se ejecuta directamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal, engine
from app.models.models import (
    Base, District, Location, Camera, AIModel, ViolationType, 
    Vehicle, VehicleOwner, OwnerVehicle, Citation, Payment, CitationAppeal, Role, User,
    Officer, OfficerAssignment, AuditLog, ProcessingJob, Video, Infraction
)
from app.routes.auth_routes import get_password_hash

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SeedData")

def seed_all_data() -> None:
    """
    Semilla principal de la base de datos relacional.
    Genera registros iniciales coherentes en las 20 tablas del sistema.
    """
    logger.info("[*] Iniciando sembrado de datos en la base de datos...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 0. Sembrar Roles y Usuarios si no existen
        if db.query(Role).count() == 0:
            role_admin = Role(id=str(uuid.uuid4()), name="Administrador")
            role_agent = Role(id=str(uuid.uuid4()), name="Agente de Tránsito")
            db.add_all([role_admin, role_agent])
            db.commit()
            logger.info("[+] Roles sembrados.")

        # 1. Sembrar Distritos
        if db.query(District).count() == 0:
            d1 = District(id=str(uuid.uuid4()), name="Zona Metropolitana Centro")
            d2 = District(id=str(uuid.uuid4()), name="Distrito Residencial Norte")
            d3 = District(id=str(uuid.uuid4()), name="Sector Industrial Sur")
            d4 = District(id=str(uuid.uuid4()), name="Comuna Comercial Este")
            db.add_all([d1, d2, d3, d4])
            db.commit()
            logger.info("[+] Distritos viales sembrados.")
        else:
            d1, d2, d3, d4 = db.query(District).limit(4).all()

        # 2. Sembrar Ubicaciones / Intersecciones
        if db.query(Location).count() == 0:
            l1 = Location(id=str(uuid.uuid4()), name="Av. Principal y Calle 10", latitude=-12.046374, longitude=-77.042793, district_id=d1.id)
            l2 = Location(id=str(uuid.uuid4()), name="Bulevar Norte - Altura Km 5", latitude=-12.025345, longitude=-77.012354, district_id=d2.id)
            l3 = Location(id=str(uuid.uuid4()), name="Cruce Peatonal Plaza Industrial", latitude=-12.094586, longitude=-77.085698, district_id=d3.id)
            l4 = Location(id=str(uuid.uuid4()), name="Intersección Av. Javier Prado y Av. Arenales", latitude=-12.086432, longitude=-77.035423, district_id=d4.id)
            db.add_all([l1, l2, l3, l4])
            db.commit()
            logger.info("[+] Intersecciones viales sembradas.")
        else:
            l1, l2, l3, l4 = db.query(Location).limit(4).all()

        # 3. Sembrar Cámaras de Monitoreo
        if db.query(Camera).count() == 0:
            cam1 = Camera(id=str(uuid.uuid4()), ip_address="192.168.10.51", resolution="1920x1080 (1080p)", status="online", manufacturer="Hikvision", location_id=l1.id)
            cam2 = Camera(id=str(uuid.uuid4()), ip_address="192.168.10.52", resolution="1920x1080 (1080p)", status="online", manufacturer="Dahua", location_id=l2.id)
            cam3 = Camera(id=str(uuid.uuid4()), ip_address="192.168.12.84", resolution="1280x720 (720p)", status="offline", manufacturer="Hikvision", location_id=l3.id)
            cam4 = Camera(id=str(uuid.uuid4()), ip_address="192.168.10.60", resolution="3840x2160 (4K)", status="maintenance", manufacturer="Bosch", location_id=l4.id)
            db.add_all([cam1, cam2, cam3, cam4])
            db.commit()
            logger.info("[+] Cámaras de seguridad de tránsito sembradas.")

        # 4. Sembrar Modelos de IA
        if db.query(AIModel).count() == 0:
            m1 = AIModel(id=str(uuid.uuid4()), name="YOLOv8 Traffic Core", version="v2.1.4", trained_at=datetime.datetime.now() - datetime.timedelta(days=90), accuracy_score=0.925)
            m2 = AIModel(id=str(uuid.uuid4()), name="License Plate OCR Model", version="v1.0.8", trained_at=datetime.datetime.now() - datetime.timedelta(days=30), accuracy_score=0.887)
            db.add_all([m1, m2])
            db.commit()
            logger.info("[+] Modelos de IA catalogados.")

        # 5. Sembrar Catálogo de Infracciones
        if db.query(ViolationType).count() == 0:
            vt1 = ViolationType(id="semaforo_rojo", name="Cruce de semáforo en rojo", base_fine=250.00, point_deduction=5, description="Cruzar la intersección cuando la luz del semáforo se encuentra en luz roja.")
            vt2 = ViolationType(id="giro_u_prohibido", name="Giro prohibido", base_fine=150.00, point_deduction=3, description="Realizar un giro en U o giro a la izquierda en zonas marcadas como prohibidas.")
            vt3 = ViolationType(id="estacionamiento_prohibido", name="Invasión de paso peatonal", base_fine=180.00, point_deduction=2, description="Detenerse o estacionarse invadiendo la zona de cruce peatonal de seguridad.")
            db.add_all([vt1, vt2, vt3])
            db.commit()
            logger.info("[+] Tipos de infracciones de catálogo sembrados.")

        # 6. Sembrar Propietarios de Vehículos
        if db.query(VehicleOwner).count() == 0:
            o1 = VehicleOwner(owner_id="DNI-45893021", full_name="Juan Carlos Gomez Estrada", address="Av. Giraldez 452, San Isidro", email="juan.gomez@gmail.com", telephone="+51 987 654 321")
            o2 = VehicleOwner(owner_id="DNI-70321458", full_name="Maria Alejandra Lopez Perez", address="Calle Los Rosales 128, Miraflores", email="maria.lopez@yahoo.com", telephone="+51 954 123 456")
            o3 = VehicleOwner(owner_id="DNI-08953102", full_name="Carlos Eduardo Perez Ramirez", address="Jr. Arequipa 954, San Borja", email="carlos.perez@outlook.com", telephone="+51 901 890 123")
            o4 = VehicleOwner(owner_id="DNI-10452390", full_name="Ana Sofia Ramirez Castro", address="Av. Larco 1024, Barranco", email="ana.ramirez@gmail.com", telephone="+51 945 765 890")
            db.add_all([o1, o2, o3, o4])
            db.commit()
            logger.info("[+] Base de datos de Propietarios de Vehículos sembrada.")
        else:
            o1, o2, o3, o4 = db.query(VehicleOwner).limit(4).all()

        # 7. Sembrar Vehículos
        if db.query(Vehicle).count() == 0:
            v1 = Vehicle(plate_number="AB-123-CD", brand="Toyota", model="Corolla", color="Gris Plata", vehicle_type="car", registration_date=datetime.date(2020, 5, 12))
            v2 = Vehicle(plate_number="XY-987-ZZ", brand="Hyundai", model="Tucson", color="Negro Perlado", vehicle_type="car", registration_date=datetime.date(2021, 9, 24))
            v3 = Vehicle(plate_number="MN-456-OP", brand="Honda", model="Civic", color="Rojo Metálico", vehicle_type="car", registration_date=datetime.date(2019, 11, 2))
            v4 = Vehicle(plate_number="TR-888-KK", brand="Volvo", model="FH16", color="Blanco", vehicle_type="truck", registration_date=datetime.date(2018, 2, 18))
            v5 = Vehicle(plate_number="MT-009-YY", brand="Yamaha", model="MT-09", color="Azul", vehicle_type="motorcycle", registration_date=datetime.date(2023, 7, 1))
            db.add_all([v1, v2, v3, v4, v5])
            db.commit()
            logger.info("[+] Registro vehicular sembrado.")
        else:
            v1, v2, v3, v4, v5 = db.query(Vehicle).limit(5).all()

        # 8. Mapear Vehículos a Propietarios
        if db.query(OwnerVehicle).count() == 0:
            ov1 = OwnerVehicle(owner_id=o1.owner_id, plate_number=v1.plate_number, purchase_date=datetime.date(2020, 6, 1), is_active_owner=True)
            ov2 = OwnerVehicle(owner_id=o2.owner_id, plate_number=v2.plate_number, purchase_date=datetime.date(2021, 10, 15), is_active_owner=True)
            ov3 = OwnerVehicle(owner_id=o3.owner_id, plate_number=v3.plate_number, purchase_date=datetime.date(2019, 12, 10), is_active_owner=True)
            ov4 = OwnerVehicle(owner_id=o4.owner_id, plate_number=v4.plate_number, purchase_date=datetime.date(2018, 5, 20), is_active_owner=True)
            ov5 = OwnerVehicle(owner_id=o1.owner_id, plate_number=v5.plate_number, purchase_date=datetime.date(2023, 8, 1), is_active_owner=True) # Juan Gomez tiene 2 vehículos
            db.add_all([ov1, ov2, ov3, ov4, ov5])
            db.commit()
            logger.info("[+] Mapeo de propietarios a vehículos sembrado.")

        # 9. Crear multas históricas (Citations, Payments, Appeals)
        if db.query(Citation).count() == 0:
            # Crear infracción mock en DB vinculada al video mock
            inf1_id = "inf_mock_001_sem_red"
            inf2_id = "inf_mock_002_uturn"
            inf3_id = "inf_mock_003_parking"
            
            # Verificar si existe al menos un video
            video_ref = db.query(Video).first()
            if not video_ref:
                video_ref = Video(id="video_mock_ref_001", nombre_archivo="cámara_vial_demo.mp4", status="completado")
                db.add(video_ref)
                db.commit()
            
            if db.query(Infraction).filter(Infraction.id == inf1_id).count() == 0:
                db_inf1 = Infraction(
                    id=inf1_id,
                    video_id=video_ref.id,
                    tipo="Cruce de semáforo en rojo",
                    frame_path="/uploads/frames/inf_mock_001.jpg",
                    timestamp=12.50,
                    descripcion="El vehículo omitió la línea de parada establecida cuando el semáforo se encontraba en luz ROJA.",
                    placa_vehiculo=v1.plate_number,
                    confianza=0.91,
                    caja_delimitadora={"x_min": 0.1, "y_min": 0.2, "x_max": 0.3, "y_max": 0.4}
                )
                db_inf2 = Infraction(
                    id=inf2_id,
                    video_id=video_ref.id,
                    tipo="Giro prohibido",
                    frame_path="/uploads/frames/inf_mock_002.jpg",
                    timestamp=25.40,
                    descripcion="Se detectó un cambio drástico de trayectoria parabólica (giro en U prohibido).",
                    placa_vehiculo=v2.plate_number,
                    confianza=0.85,
                    caja_delimitadora={"x_min": 0.4, "y_min": 0.4, "x_max": 0.6, "y_max": 0.7}
                )
                db_inf3 = Infraction(
                    id=inf3_id,
                    video_id=video_ref.id,
                    tipo="Invasión de paso peatonal",
                    frame_path="/uploads/frames/inf_mock_003.jpg",
                    timestamp=42.10,
                    descripcion="Permaneció inmóvil dentro de la zona restringida de seguridad peatonal.",
                    placa_vehiculo=v5.plate_number,
                    confianza=0.88,
                    caja_delimitadora={"x_min": 0.2, "y_min": 0.5, "x_max": 0.4, "y_max": 0.9}
                )
                db.add_all([db_inf1, db_inf2, db_inf3])
                db.commit()

            # Vincular Citaciones Oficiales
            c1 = Citation(
                citation_id="CIT-2026-0001",
                infraction_id=inf1_id,
                owner_id=o1.owner_id,
                plate_number=v1.plate_number,
                fine_amount=250.00,
                due_date=datetime.date(2026, 7, 30),
                status="pendiente"
            )
            c2 = Citation(
                citation_id="CIT-2026-0002",
                infraction_id=inf2_id,
                owner_id=o2.owner_id,
                plate_number=v2.plate_number,
                fine_amount=150.00,
                due_date=datetime.date(2026, 5, 15),
                status="pagada"
            )
            c3 = Citation(
                citation_id="CIT-2026-0003",
                infraction_id=inf3_id,
                owner_id=o1.owner_id,
                plate_number=v5.plate_number,
                fine_amount=180.00,
                due_date=datetime.date(2026, 8, 15),
                status="apelada"
            )
            db.add_all([c1, c2, c3])
            db.commit()
            logger.info("[+] Citaciones oficiales vinculadas.")

            # Registrar Pagos
            p1 = Payment(
                payment_id="PAY-998821",
                citation_id=c2.citation_id,
                amount_paid=150.00,
                payment_method="credit_card",
                transaction_number="TXN-MIRAF-4592039-B",
                payment_date=datetime.datetime.now() - datetime.timedelta(days=20)
            )
            db.add(p1)
            db.commit()
            logger.info("[+] Registro de pagos sembrado.")

            # Registrar Apelaciones
            ap1 = CitationAppeal(
                appeal_id="APP-445021",
                citation_id=c3.citation_id,
                reason="El vehículo se detuvo sobre el paso peatonal para ceder el paso a una ambulancia que venía en sentido contrario con sirenas encendidas.",
                status="en_proceso"
            )
            db.add(ap1)
            db.commit()
            logger.info("[+] Registro de apelaciones sembrado.")

        # 10. Registrar Oficiales y Asignaciones
        if db.query(Officer).count() == 0:
            off1 = Officer(badge_number="PL-98210", name="Agente Marcos Gutierrez Torres", rank="Sargento", district_id=d1.id)
            off2 = Officer(badge_number="PL-50129", name="Agente Lucia Mendez Diaz", rank="Sub-Oficial", district_id=d2.id)
            db.add_all([off1, off2])
            db.commit()
            
            as1 = OfficerAssignment(
                assignment_id=str(uuid.uuid4()),
                badge_number=off1.badge_number,
                location_id=l1.id,
                shift_start=datetime.datetime.now() - datetime.timedelta(hours=4),
                shift_end=datetime.datetime.now() + datetime.timedelta(hours=4)
            )
            as2 = OfficerAssignment(
                assignment_id=str(uuid.uuid4()),
                badge_number=off2.badge_number,
                location_id=l2.id,
                shift_start=datetime.datetime.now() - datetime.timedelta(hours=8),
                shift_end=datetime.datetime.now()
            )
            db.add_all([as1, as2])
            db.commit()
            logger.info("[+] Registro de agentes de tránsito sembrado.")

        # 11. Registrar Trabajos de IA (Processing Jobs)
        if db.query(ProcessingJob).count() == 0:
            video_ref = db.query(Video).first()
            if not video_ref:
                video_ref = Video(id="video_mock_ref_001", nombre_archivo="cámara_vial_demo.mp4", status="completado")
                db.add(video_ref)
                db.commit()
            
            job1 = ProcessingJob(
                id=str(uuid.uuid4()),
                video_id=video_ref.id,
                start_time=datetime.datetime.now() - datetime.timedelta(minutes=10),
                end_time=datetime.datetime.now() - datetime.timedelta(minutes=8),
                status="completado",
                logs="[INFO] Iniciando lectura de video...\n[INFO] Extracción de cuadros a 30 FPS...\n[INFO] Ejecutando YOLOv8n...\n[INFO] Vehículo track ID 1 detectado...\n[INFO] Infracción: Cruce en semáforo en rojo. Registrando evidencia..."
            )
            db.add(job1)
            db.commit()
            logger.info("[+] Registro de trabajos de IA sembrado.")

        # 12. Registrar Logs de Auditoría
        if db.query(AuditLog).count() == 0:
            admin_user = db.query(User).filter(User.username == "admin").first()
            u_id = admin_user.id if admin_user else None
            log1 = AuditLog(
                log_id=str(uuid.uuid4()),
                user_id=u_id,
                action="SEMBRADO_DATOS",
                table_name="districts, cameras, vehicle_owners",
                details="Inyección automática de datos de prueba para la red vial e historial ciudadano.",
                timestamp=datetime.datetime.now()
            )
            log2 = AuditLog(
                log_id=str(uuid.uuid4()),
                user_id=u_id,
                action="REGISTRO_CAMARA",
                table_name="cameras",
                details="Se registró una nueva cámara de vigilancia Hikvision con IP 192.168.10.51.",
                timestamp=datetime.datetime.now() - datetime.timedelta(minutes=15)
            )
            db.add_all([log1, log2])
            db.commit()
            logger.info("[+] Registro de logs de auditoría sembrado.")

        logger.info("[*] ¡Sembrado de base de datos relacional de 20 tablas finalizado con éxito!")

    except Exception as e:
        logger.error(f"[ERROR] Ocurrió un error sembrando la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_data()
