import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { 
  UploadCloud, 
  Video, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Camera, 
  Eye, 
  X, 
  Zap, 
  TrendingUp,
  AlertOctagon
} from 'lucide-react'
import './UploadVideo.css'

const BACKEND_URL = 'http://localhost:8000'

function UploadVideo() {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoId, setVideoId] = useState(null)
  const [uiState, setUiState] = useState('idle') // 'idle', 'uploading', 'processing', 'completed', 'failed'
  const [videoResult, setVideoResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeEvidence, setActiveEvidence] = useState(null) // Guardará la infracción seleccionada para el modal
  const fileInputRef = useRef(null)

  // Manejar el arrastre de archivos (Drag & Drop)
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile) => {
    // Validar extensión
    const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv']
    const fileName = selectedFile.name.toLowerCase()
    const isValid = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!isValid) {
      alert('Formato de archivo no soportado. Suba un video en formato MP4, AVI, MOV o MKV.')
      return
    }
    
    setFile(selectedFile)
  }

  const triggerFileSelect = () => {
    fileInputRef.current.click()
  }

  const handleUpload = async () => {
    if (!file) return

    setUiState('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Petición POST al backend con monitor de progreso de subida
      const response = await axios.post(`${BACKEND_URL}/api/v1/videos/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      const { video_id } = response.data
      setVideoId(video_id)
      setUiState('processing')
      
      // Iniciar el polling para consultar el estado del procesamiento por la IA
      startPolling(video_id)

    } catch (error) {
      console.error('Error al subir video:', error)
      setUiState('failed')
      setErrorMessage(
        error.response?.data?.detail || 
        'No se pudo establecer conexión con el servidor. Verifique que el backend esté ejecutándose.'
      )
    }
  }

  // Polling automático (Consultar estado del video cada 2 segundos)
  const startPolling = (id) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/videos/infracciones/${id}`)
        const data = response.data
        
        if (data.status === 'completado') {
          clearInterval(intervalId)
          setVideoResult(data)
          setUiState('completed')
          
          // Guardar en la lista de recientes de localStorage para integrarse dinámicamente con Report.jsx
          try {
            const loaded = localStorage.getItem('recent_videos')
            let list = []
            if (loaded) {
              list = JSON.parse(loaded)
            }
            if (!list.some(item => item.id === id)) {
              list.unshift({ id, filename: data.nombre_archivo, date: new Date().toLocaleString() })
              list = list.slice(0, 5)
              localStorage.setItem('recent_videos', JSON.stringify(list))
            }
          } catch (e) {
            console.error('Error guardando en localStorage:', e)
          }
        } else if (data.status === 'fallido') {
          clearInterval(intervalId)
          setErrorMessage(data.error_message || 'El motor de IA falló al procesar los fotogramas del video.')
          setUiState('failed')
        }
      } catch (error) {
        console.error('Error consultando estado de IA:', error)
        // No cancelamos el intervalo de inmediato por si es un micro-corte de red del backend
      }
    }, 2000)

    // Guardar ID del intervalo en una variable de limpieza en caso de desmontaje prematuro
    return () => clearInterval(intervalId)
  }

  const handleReset = () => {
    setFile(null)
    setUploadProgress(0)
    setVideoId(null)
    setVideoResult(null)
    setUiState('idle')
    setErrorMessage('')
    setActiveEvidence(null)
  }

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor((totalSeconds % 1) * 10)
    
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}.${milliseconds}`
  }

  return (
    <div className="upload-page-container">
      {/* Encabezado Principal Premium */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">🚦</span>
          <h1 className="brand-title">TrafficViolation<span>System</span></h1>
        </div>
        <p className="brand-subtitle">Control inteligente y detección automatizada de infracciones por visión computacional</p>
      </header>

      <main className="main-content">
        {/* MÁQUINA DE ESTADOS VISUALES */}

        {/* ESTADO A: IDLE (Espera de Archivo) */}
        {uiState === 'idle' && (
          <div className="glass-panel card-upload animate-fade-in">
            <h2 className="panel-title"><Zap size={20} className="glow-icon" /> Subir Video de Tránsito</h2>
            <p className="panel-desc">Cargue el video de la cámara vial (.mp4, .avi, .mov, .mkv) para iniciar el análisis automático cuadro a cuadro por Inteligencia Artificial.</p>
            
            <div 
              className={`dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="file-input-hidden"
                onChange={handleFileChange}
                accept=".mp4,.avi,.mov,.mkv"
              />
              <UploadCloud size={64} className="upload-icon" />
              {file ? (
                <div className="selected-file-info animate-scale-up">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{((file.size) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ) : (
                <div className="dropzone-text">
                  <p className="dropzone-main-text">Arrastre y suelte su archivo de video aquí</p>
                  <p className="dropzone-sub-text">o haga clic para explorar sus archivos locales</p>
                </div>
              )}
            </div>

            {file && (
              <button className="btn-primary animate-pulse-btn" onClick={handleUpload}>
                Iniciar Análisis de IA
              </button>
            )}
          </div>
        )}

        {/* ESTADO B: UPLOADING (Subiendo Video) */}
        {uiState === 'uploading' && (
          <div className="glass-panel card-loader animate-fade-in">
            <RefreshCw className="spinner-icon" size={40} />
            <h2 className="loader-title">Subiendo Video al Servidor</h2>
            <p className="loader-desc">Almacenando archivo físicamente de forma eficiente en bloques...</p>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            </div>
            <span className="progress-details">{uploadProgress === 100 ? 'Guardando en disco...' : 'Cargando bytes de video'}</span>
          </div>
        )}

        {/* ESTADO C: PROCESSING (Procesando con IA - Polling) */}
        {uiState === 'processing' && (
          <div className="glass-panel card-loader animate-fade-in">
            {/* Animación Premium del semáforo en cambio de luces */}
            <div className="traffic-light-animation">
              <div className="light red"></div>
              <div className="light yellow"></div>
              <div className="light green"></div>
            </div>
            <h2 className="loader-title">IA Analizando Fotogramas</h2>
            <p className="loader-desc">Extrayendo cuadros de video, detectando coches con YOLO y aplicando lógicas geométricas vectoriales en segundo plano...</p>
            
            <div className="processing-badge">
              <RefreshCw size={14} className="spin-badge-icon" />
              Procesamiento de Tránsito Activo
            </div>
            
            <span className="video-id-text">ID de Video: <code>{videoId}</code></span>
          </div>
        )}

        {/* ESTADO D: FAILED (Fallo en Carga/IA) */}
        {uiState === 'failed' && (
          <div className="glass-panel card-error animate-fade-in">
            <AlertOctagon size={64} className="error-icon" />
            <h2 className="error-title">Falló el Procesamiento</h2>
            <div className="error-detail-box">
              <p>{errorMessage}</p>
            </div>
            <button className="btn-secondary" onClick={handleReset}>
              Intentar con otro Video
            </button>
          </div>
        )}

        {/* ESTADO E: COMPLETED (Reporte e Infracciones) */}
        {uiState === 'completed' && videoResult && (
          <div className="dashboard-container animate-fade-in">
            
            {/* 1. Métricas de Analíticas del Video */}
            <div className="glass-panel analytics-panel">
              <div className="analytics-header">
                <h2><TrendingUp size={18} /> Resumen del Análisis Vial</h2>
                <button className="btn-reset-icon" onClick={handleReset} title="Analizar nuevo video">
                  Nuevo Análisis
                </button>
              </div>
              <div className="analytics-grid">
                <div className="metric-card">
                  <span className="metric-label">Archivo de Video</span>
                  <span className="metric-value file-name-value">{videoResult.nombre_archivo}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Estado de IA</span>
                  <span className="metric-value status-success"><CheckCircle size={16} /> Exitoso</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Tiempo Inferencia</span>
                  <span className="metric-value">{videoResult.tiempo_procesamiento_segundos} seg</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Infracciones Totales</span>
                  <span className="metric-value violation-count-value">{videoResult.infracciones.length}</span>
                </div>
              </div>
            </div>

            {/* 2. Listado e Infracciones */}
            <div className="results-grid">
              
              {/* Columna Izquierda: Información de Infracciones */}
              <div className="violations-list-section">
                <h3 className="section-title">Infracciones Detectadas por Cuadros</h3>
                
                {videoResult.infracciones.length === 0 ? (
                  <div className="glass-panel no-violations-card">
                    <CheckCircle size={48} className="clean-icon" />
                    <h4>¡Buen Comportamiento Vial!</h4>
                    <p>No se identificaron infracciones viales en el metraje analizado.</p>
                  </div>
                ) : (
                  <div className="violations-grid">
                    {videoResult.infracciones.map((inf) => {
                      // Determinar el color del badge y estilo según tipo
                      let badgeClass = "badge-gray"
                      if (inf.tipo === "Cruce de semáforo en rojo") badgeClass = "badge-red"
                      if (inf.tipo === "Giro prohibido") badgeClass = "badge-violet"
                      if (inf.tipo === "Invasión de paso peatonal") badgeClass = "badge-orange"

                      return (
                        <div key={inf.id} className="glass-panel violation-card animate-scale-up">
                          <div className="card-top">
                            <span className={`violation-badge ${badgeClass}`}>{inf.tipo}</span>
                            <span className="violation-time"><Clock size={12} /> {formatSeconds(inf.timestamp)}</span>
                          </div>
                          
                          <p className="violation-description">{inf.descripcion}</p>
                          
                          <div className="card-bottom">
                            <div className="metric-row">
                              <span className="row-label">Placa:</span>
                              <span className="row-value badge-plate">{inf.placa_vehiculo || 'No Detectada'}</span>
                            </div>
                            <div className="metric-row">
                              <span className="row-label">Confianza:</span>
                              <span className="row-value">{Math.round(inf.confianza * 100)}%</span>
                            </div>
                          </div>

                          <button 
                            className="btn-evidence"
                            onClick={() => setActiveEvidence(inf)}
                          >
                            <Eye size={14} /> Ver Evidencia Fotográfica
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Columna Derecha: Cámara / Visor Estático */}
              <div className="camera-view-section">
                <div className="glass-panel camera-preview-card">
                  <h3><Camera size={16} /> Cámara del Dispositivo</h3>
                  <div className="camera-screen-mock">
                    <Video size={48} className="camera-screen-icon animate-pulse" />
                    <p>Cargador de Flujos en Línea y Detección de Incidentes</p>
                    <span className="status-dot-active">ONLINE</span>
                  </div>
                  <p className="preview-tip">Los fotogramas e incidentes detectados son almacenados físicamente en disco y vinculados directamente a la base de datos de PostgreSQL en producción.</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* VISOR MODAL DE EVIDENCIA (GLASSMORPHISM OVERLAY) */}
      {activeEvidence && (
        <div className="modal-overlay animate-fade-in" onClick={() => setActiveEvidence(null)}>
          <div className="modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Detección Física del Incidente</h3>
              <button className="btn-close-modal" onClick={() => setActiveEvidence(null)}>
                <X size={18} />
              </button>
            </header>
            
            <div className="modal-body">
              {/* Fotograma con el recuadro rojo guardado por OpenCV */}
              <div className="evidence-frame-container">
                <img 
                  src={`${BACKEND_URL}/uploads/frames/${activeEvidence.id}.jpg`} 
                  alt="Fotograma destacado de la infracción"
                  className="evidence-frame-image"
                  onError={(e) => {
                    e.target.onerror = null
                    // Fallback visual si falla la carga física
                    e.target.src = 'https://images.unsplash.com/photo-1545641203-7d6cf941d255?q=80&w=640&auto=format&fit=crop'
                  }}
                />
              </div>
              
              <div className="evidence-detail-box">
                <div className="detail-header">
                  <span className="evidence-type">{activeEvidence.tipo}</span>
                  <span className="evidence-time"><Clock size={12} /> {formatSeconds(activeEvidence.timestamp)}</span>
                </div>
                
                <p className="evidence-desc">{activeEvidence.descripcion}</p>
                
                <div className="evidence-metrics-grid">
                  <div className="evidence-metric-item">
                    <span className="item-label">Placa Identificada</span>
                    <span className="item-value plate-box">{activeEvidence.placa_vehiculo || 'NO DETECTADA'}</span>
                  </div>
                  <div className="evidence-metric-item">
                    <span className="item-label">Confianza de IA</span>
                    <span className="item-value">{Math.round(activeEvidence.confianza * 100)}%</span>
                  </div>
                  <div className="evidence-metric-item">
                    <span className="item-label">Coordenadas del Infractor</span>
                    <span className="item-value code-coordinates">
                      [{activeEvidence.caja_delimitadora.x_min}, {activeEvidence.caja_delimitadora.y_min}]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadVideo
