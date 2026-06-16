-- =====================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS PARA SISTEMA DE CONTROL DE TRÁNSITO
-- MOTOR RECOMENDADO: PostgreSQL
-- TOTAL DE TABLAS: 20
-- =====================================================================

-- DOMINIO 1: USUARIOS Y ACCESO
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(36) REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- DOMINIO 2: GEOLOCALIZACIÓN Y EQUIPAMIENTO VIAL
CREATE TABLE districts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    district_id VARCHAR(36) REFERENCES districts(id) ON DELETE SET NULL
);

CREATE TABLE cameras (
    id VARCHAR(36) PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    resolution VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'offline', -- 'online', 'offline', 'maintenance'
    manufacturer VARCHAR(100),
    location_id VARCHAR(36) REFERENCES locations(id) ON DELETE SET NULL
);

-- DOMINIO 3: PROCESAMIENTO E IA
CREATE TABLE ai_models (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    trained_at TIMESTAMP,
    accuracy_score REAL
);

CREATE TABLE videos (
    id VARCHAR(36) PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(512),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'procesando', -- 'procesando', 'completado', 'fallido'
    error_message VARCHAR(1000),
    tiempo_procesamiento_segundos REAL,
    ai_model_id VARCHAR(36) REFERENCES ai_models(id) ON DELETE SET NULL
);

CREATE TABLE processing_jobs (
    id VARCHAR(36) PRIMARY KEY,
    video_id VARCHAR(36) REFERENCES videos(id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    logs TEXT
);

-- DOMINIO 4: CATÁLOGOS E INFRACCIONES DE IA
CREATE TABLE violation_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    base_fine DOUBLE PRECISION NOT NULL,
    point_deduction INTEGER DEFAULT 0,
    description VARCHAR(500)
);

CREATE TABLE infractions (
    id VARCHAR(50) PRIMARY KEY,
    video_id VARCHAR(36) REFERENCES videos(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    frame_path VARCHAR(512) NOT NULL,
    timestamp REAL NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    placa_vehiculo VARCHAR(20),
    confianza REAL NOT NULL,
    caja_delimitadora JSON NOT NULL
);

-- DOMINIO 5: REGISTRO VEHICULAR Y PROPIETARIOS
CREATE TABLE vehicles (
    plate_number VARCHAR(20) PRIMARY KEY,
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    vehicle_type VARCHAR(50), -- 'car', 'motorcycle', 'truck', 'bus'
    registration_date DATE
);

CREATE TABLE vehicle_owners (
    owner_id VARCHAR(50) PRIMARY KEY, -- Cédula/DNI/DNT
    full_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    email VARCHAR(100),
    telephone VARCHAR(50)
);

CREATE TABLE owners_vehicles (
    owner_id VARCHAR(50) REFERENCES vehicle_owners(owner_id) ON DELETE CASCADE,
    plate_number VARCHAR(20) REFERENCES vehicles(plate_number) ON DELETE CASCADE,
    purchase_date DATE,
    is_active_owner BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (owner_id, plate_number)
);

-- DOMINIO 6: MULTAS, PAGOS Y APELACIONES
CREATE TABLE citations (
    citation_id VARCHAR(50) PRIMARY KEY,
    infraction_id VARCHAR(50) REFERENCES infractions(id) ON DELETE CASCADE,
    owner_id VARCHAR(50) REFERENCES vehicle_owners(owner_id) ON DELETE CASCADE,
    plate_number VARCHAR(20) REFERENCES vehicles(plate_number) ON DELETE SET NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fine_amount DOUBLE PRECISION NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente' -- 'pendiente', 'pagada', 'vencida', 'apelada'
);

CREATE TABLE payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    citation_id VARCHAR(50) REFERENCES citations(citation_id) ON DELETE CASCADE,
    amount_paid DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', 'cash'
    transaction_number VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE citation_appeals (
    appeal_id VARCHAR(50) PRIMARY KEY,
    citation_id VARCHAR(50) REFERENCES citations(citation_id) ON DELETE CASCADE,
    appeal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'en_proceso', -- 'en_proceso', 'aceptada', 'rechazada'
    resolution_date TIMESTAMP,
    resolution_notes TEXT
);

-- DOMINIO 7: AGENTES Y AUDITORÍA
CREATE TABLE officers (
    badge_number VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    rank VARCHAR(100),
    district_id VARCHAR(36) REFERENCES districts(id) ON DELETE SET NULL
);

CREATE TABLE officer_assignments (
    assignment_id VARCHAR(36) PRIMARY KEY,
    badge_number VARCHAR(50) REFERENCES officers(badge_number) ON DELETE CASCADE,
    location_id VARCHAR(36) REFERENCES locations(id) ON DELETE CASCADE,
    shift_start TIMESTAMP,
    shift_end TIMESTAMP
);

CREATE TABLE audit_logs (
    log_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- CREACIÓN DE ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- =====================================================================
CREATE INDEX idx_infractions_plate ON infractions(placa_vehiculo);
CREATE INDEX idx_citations_owner ON citations(owner_id);
CREATE INDEX idx_citations_plate ON citations(plate_number);
CREATE INDEX idx_cameras_status ON cameras(status);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
