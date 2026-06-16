import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { 
  Search, 
  Video, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Camera, 
  Eye, 
  Play, 
  ChevronRight,
  History,
  AlertOctagon,
  FileText,
  X
} from 'lucide-react'
import './Report.css'

const BACKEND_URL = 'http://localhost:8000'

function Report() {
  const [searchId, setSearchId] = useState('')
  const [videoResult, setVideoResult] = useState(null)
  const [uiState, setUiState] = useState('idle') // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [recentVideos, setRecentVideos] = useState([])
  const [currentTime, setCurrentTime] = useState(0)
  const [activeInfraction, setActiveInfraction] = useState(null)
  const [activeLightbox, setActiveLightbox] = useState(null)
  const videoRef = useRef(null)

  // Cargar videos recientes de localStorage para facilitar las pruebas
  useEffect(() => {
    const loaded = localStorage.getItem('recent_videos')
    if (loaded) {
      try {
        setRecentVideos(JSON.parse(loaded))
      } catch (e) {
        console.error('Error parseando videos recientes:', e)
      }
    }
  }, [])

  // Cerrar lightbox con clic fuera u Escape para accesibilidad
  useEffect(() => {
    if (!activeLightbox) return
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        setActiveLightbox(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveLightbox(null)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('click', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeLightbox])

  // Monitorear el tiempo de reproducción para sincronizar infracciones y bounding boxes
  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoResult) return
    const time = videoRef.current.currentTime
    setCurrentTime(time)

    // Buscar si hay alguna infracción ocurriendo en la marca de tiempo actual (ventana de 2 segundos)
    const active = videoResult.infractions.find(inf => 
      time >= inf.timestamp && time <= inf.timestamp + 2.0
    )
    
    setActiveInfraction(active || null)
  }

  const handleSearch = async (idToSearch) => {
    const id = idToSearch || searchId
    if (!id.trim()) return

    setUiState('loading')
    setErrorMessage('')
    setVideoResult(null)
    setActiveInfraction(null)

    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/videos/infractions/${id}`)
      const data = response.data
      
      setVideoResult(data)
      setUiState('success')
      
      // Guardar en la lista de recientes de localStorage si es exitoso
      updateRecentVideos(id, data.nombre_archivo)
      
    } catch (error) {
      console.error('Error buscando reporte:', error)
      setUiState('error')
      setErrorMessage(
        error.response?.data?.detail || 
        'No se encontró ningún reporte para el ID especificado o el servidor no responde.'
      )
    }
  }

  const updateRecentVideos = (id, filename) => {
    let list = [...recentVideos]
    // Evitar duplicados
    if (!list.some(item => item.id === id)) {
      list.unshift({ id, filename, date: new Date().toLocaleString() })
      // Guardar un máximo de 5
      list = list.slice(0, 5)
      setRecentVideos(list)
      localStorage.setItem('recent_videos', JSON.stringify(list))
    }
  }

  const seekTo = (timestamp) => {
    if (videoRef.current) {
      // Avanzar el reproductor al segundo del incidente y reproducir
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
    }
  }

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor((totalSeconds % 1) * 10)
    
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}.${milliseconds}`
  }

  // Extraer extensión original del nombre del archivo para armar la URL del video del backend
  const getVideoUrl = () => {
    if (!videoResult) return ''
    const filename = videoResult.nombre_archivo
    const fileExt = filename.substring(filename.lastIndexOf('.'))
    return `${BACKEND_URL}/uploads/${videoResult.video_id}${fileExt}`
  }

  return (
    <div className="report-page-container">
      {/* Encabezado del Dashboard */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">📊</span>
          <h1 className="brand-title">Control<span>Vial</span></h1>
        </div>
        <p className="brand-subtitle">Panel administrativo de reportes e inspección de incidentes sincronizados</p>
      </header>

      {/* 1. SECCIÓN DE BÚSQUEDA Y SELECCIÓN */}
      <div className="glass-panel search-section-panel animate-fade-in">
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-bar-icon" />
            <input 
              type="text" 
              placeholder="Ingrese el UUID del video analizado (e.g. 15f97742-2841-4a86...)" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="search-input-field"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn-primary btn-search" onClick={() => handleSearch()}>
            Buscar Reporte
          </button>
        </div>

        {recentVideos.length > 0 && (
          <div className="recent-history-row">
            <span className="history-label"><History size={13} /> Consultas Recientes:</span>
            <div className="recent-badges-list">
              {recentVideos.map((video) => (
                <button 
                  key={video.id} 
                  className="badge-recent-video"
                  onClick={() => {
                    setSearchId(video.id)
                    handleSearch(video.id)
                  }}
                  title={video.id}
                >
                  <FileText size={11} /> {video.filename}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. MAQUINA DE ESTADOS VISUALES DEL MONITOREO */}
      <main className="main-content">
        
        {/* ESTADO A: IDLE (Espera de Búsqueda) */}
        {uiState === 'idle' && (
          <div className="glass-panel card-idle-message animate-fade-in">
            <Video size={64} className="idle-decor-icon animate-pulse" />
            <h3>Monitoreo Relacional Activo</h3>
            <p>Ingrese un identificador único de video en el buscador superior para cargar el análisis vial detallado, reproducir las trayectorias sincronizadas e inspeccionar fotogramas de evidencia física.</p>
          </div>
        )}

        {/* ESTADO B: LOADING (Cargando datos SQL) */}
        {uiState === 'loading' && (
          <div className="glass-panel card-loader-report animate-fade-in">
            <RefreshCw className="spinner-icon-report" size={40} />
            <h3>Buscando en Servidor SQL</h3>
            <p>Consultando base de datos relacional de PostgreSQL, vinculando relaciones uno-a-muchos y preparando fotogramas...</p>
          </div>
        )}

        {/* ESTADO C: ERROR (No encontrado/Error de servidor) */}
        {uiState === 'error' && (
          <div className="glass-panel card-error-report animate-fade-in">
            <AlertOctagon size={64} className="error-icon-report" />
            <h3>Reporte No Encontrado</h3>
            <p className="error-msg-text">{errorMessage}</p>
          </div>
        )}

        {/* ESTADO D: SUCCESS (Panel Interactivo Completo) */}
        {uiState === 'success' && videoResult && (
          <div className="report-dashboard-grid animate-fade-in">
            
            {/* COLUMNA IZQUIERDA: REPRODUCTOR SINCRONIZADO CON CANVAS IA */}
            <div className="video-player-section">
              <div className="glass-panel player-card">
                <div className="player-header">
                  <span className="live-badge"><span className="red-dot"></span> REPRODUCCIÓN DIGITAL</span>
                  <h2 className="player-title">{videoResult.nombre_archivo}</h2>
                </div>

                {/* Contenedor relativo que aloja el video y la capa absoluta de Bounding Boxes */}
                <div className="media-container-relative">
                  <video 
                    ref={videoRef}
                    src={getVideoUrl()} 
                    controls
                    className="html5-video-player"
                    onTimeUpdate={handleTimeUpdate}
                    onError={(e) => {
                      logger.error("Error al cargar video nativamente");
                    }}
                  />

                  {/* CAPA FLOTANTE DE RECUADRO DE EVIDENCIA IA (BOUNDING BOX OVERLAY) */}
                  {activeInfraction && (
                    <div 
                      className="ai-bounding-box-overlay"
                      style={{
                        left: `${activeInfraction.caja_delimitadora.x_min * 100}%`,
                        top: `${activeInfraction.caja_delimitadora.y_min * 100}%`,
                        width: `${(activeInfraction.caja_delimitadora.x_max - activeInfraction.caja_delimitadora.x_min) * 100}%`,
                        height: `${(activeInfraction.caja_delimitadora.y_max - activeInfraction.caja_delimitadora.y_min) * 100}%`
                      }}
                    >
                      <span className="box-overlay-label">
                        {activeInfraction.placa_vehiculo || 'VEHÍCULO'}
                      </span>
                    </div>
                  )}

                  {/* BANNER FLOTANTE DE ALERTA DE IA EN TIEMPO REAL */}
                  {activeInfraction && (
                    <div className="ai-floating-alert-banner animate-scale-up">
                      <AlertTriangle size={16} className="alert-banner-icon" />
                      <span>
                        <strong>INFRACCIÓN DETECTADA:</strong> {activeInfraction.tipo.toUpperCase()} {activeInfraction.placa_vehiculo ? `(PLACA: ${activeInfraction.placa_vehiculo})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="player-footer">
                  <div className="footer-metric">
                    <span className="footer-label">Marca de Tiempo</span>
                    <span className="footer-value code-font">{formatSeconds(currentTime)}</span>
                  </div>
                  <div className="footer-metric">
                    <span className="footer-label">Estado del Semáforo</span>
                    <span className="footer-value">
                      {/* Sincronizar color según la alerta actual o el ciclo del video */}
                      {activeInfraction && activeInfraction.tipo === "Cruce de semáforo en rojo" ? (
                        <span className="semaphore-indicator red-glow">Luz Roja</span>
                      ) : (
                        <span className="semaphore-indicator green-glow">Activo / Operacional</span>
                      )}
                    </span>
                  </div>
                  <div className="footer-metric">
                    <span className="footer-label">Inferencia</span>
                    <span className="footer-value code-font">YOLOv8 + OpenCV</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Analíticas Inferior */}
              <div className="glass-panel stats-lower-panel animate-fade-in">
                <h4>Metadatos Relacionales PostgreSQL</h4>
                <div className="lower-stats-grid">
                  <div className="lower-stat-item">
                    <span className="stat-label">ID de Video</span>
                    <span className="stat-value code-font font-small">{videoResult.video_id}</span>
                  </div>
                  <div className="lower-stat-item">
                    <span className="stat-label">Fecha de Carga</span>
                    <span className="stat-value font-small">
                      {videoResult.fecha_subida ? new Date(videoResult.fecha_subida).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="lower-stat-item">
                    <span className="stat-label">Tiempo Inferencia</span>
                    <span className="stat-value">{videoResult.tiempo_procesamiento_segundos} segundos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: SIDEBAR DE INFRACCIONES CON MINIATURA */}
            <div className="report-sidebar-section">
              <h3 className="section-title">Evidencias Guardadas ({videoResult.infractions.length})</h3>
              
              {videoResult.infractions.length === 0 ? (
                <div className="glass-panel clean-report-card">
                  <CheckCircle size={40} className="report-clean-icon" />
                  <h4>Video Libre de Multas</h4>
                  <p>El motor de visión por computadora OpenCV + YOLO completó el escaneo sin registrar violaciones de tránsito.</p>
                </div>
              ) : (
                <div className="report-violations-list">
                  {videoResult.infractions.map((inf) => {
                    // Verificar si esta infracción está activa según el tiempo actual del reproductor
                    const isCurrentlyActive = activeInfraction && activeInfraction.id === inf.id
                    
                    let badgeClass = "badge-gray"
                    if (inf.tipo === "Cruce de semáforo en rojo") badgeClass = "badge-red"
                    if (inf.tipo === "Giro prohibido") badgeClass = "badge-violet"
                    if (inf.tipo === "Invasión de paso peatonal") badgeClass = "badge-orange"

                    return (
                      <div 
                        key={inf.id} 
                        className={`glass-panel report-violation-card ${isCurrentlyActive ? 'card-active-neon' : ''} animate-scale-up`}
                      >
                        <div className="report-card-body">
                          
                          {/* Miniatura física de evidencia (.jpg) */}
                          <button 
                            type="button"
                            className="evidence-thumbnail-container"
                            onClick={() => setActiveLightbox(inf)}
                            title="Ampliar captura de pantalla de evidencia"
                          >
                            <img 
                              src={`${BACKEND_URL}/uploads/frames/${inf.id}.jpg`} 
                              alt="Miniatura de infracción" 
                              className="evidence-thumbnail-img"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1545641203-7d6cf941d255?q=80&w=300&auto=format&fit=crop'
                              }}
                            />
                            <div className="thumbnail-hover-overlay">
                              <Eye size={12} />
                            </div>
                          </button>

                          {/* Detalle Textual */}
                          <div className="report-card-text">
                            <div className="report-card-header-row">
                              <span className={`violation-badge ${badgeClass}`}>{inf.tipo}</span>
                              <span className="violation-time"><Clock size={11} /> {formatSeconds(inf.timestamp)}</span>
                            </div>
                            <p className="report-card-desc" title={inf.descripcion}>
                              {inf.descripcion}
                            </p>
                            <div className="report-card-meta-row">
                              <span className="plate-badge-report">{inf.placa_vehiculo || 'No detectada'}</span>
                              <span className="conf-value-report">IA: {Math.round(inf.confianza * 100)}%</span>
                            </div>
                          </div>

                        </div>

                        {/* Botón para reproducir incidente sincronizadamente */}
                        <button 
                          className="btn-seek-incident"
                          onClick={() => seekTo(inf.timestamp)}
                        >
                          <Play size={12} fill="currentColor" /> Saltar al Segundo {formatSeconds(inf.timestamp)}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* VISOR LIGHTBOX EMERGENTE DE ALTA RESOLUCIÓN */}
      {activeLightbox && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel animate-scale-up">
            <header className="modal-header">
              <h3>Captura de Evidencia en Alta Resolución (OpenCV)</h3>
              <button className="btn-close-modal" onClick={() => setActiveLightbox(null)}>
                <X size={18} />
              </button>
            </header>
            
            <div className="modal-body">
              <div className="evidence-frame-container">
                <img 
                  src={`${BACKEND_URL}/uploads/frames/${activeLightbox.id}.jpg`} 
                  alt="Fotograma destacado ampliado"
                  className="evidence-frame-image"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1545641203-7d6cf941d255?q=80&w=640&auto=format&fit=crop'
                  }}
                />
              </div>
              
              <div className="evidence-detail-box">
                <div className="detail-header">
                  <span className="evidence-type">{activeLightbox.tipo}</span>
                  <span className="evidence-time"><Clock size={12} /> {formatSeconds(activeLightbox.timestamp)}</span>
                </div>
                
                <p className="evidence-desc">{activeLightbox.descripcion}</p>
                
                <div className="evidence-metrics-grid">
                  <div className="evidence-metric-item">
                    <span className="item-label">Placa Identificada</span>
                    <span className="item-value plate-box">{activeLightbox.placa_vehiculo || 'NO DETECTADA'}</span>
                  </div>
                  <div className="evidence-metric-item">
                    <span className="item-label">Confianza de IA</span>
                    <span className="item-value">{Math.round(activeLightbox.confianza * 100)}%</span>
                  </div>
                  <div className="evidence-metric-item">
                    <span className="item-label">Coordenadas Normales</span>
                    <span className="item-value code-coordinates">
                      [{activeLightbox.caja_delimitadora.x_min}, {activeLightbox.caja_delimitadora.y_min}]
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

export default Report
