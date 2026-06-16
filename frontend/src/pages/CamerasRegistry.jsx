import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Camera, 
  Plus, 
  Search, 
  MapPin, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react'
import './CamerasRegistry.css'
import { getBackendUrl } from '../utils/config.js'

const BACKEND_URL = getBackendUrl()

function CamerasRegistry() {
  const [cameras, setCameras] = useState([])
  const [locations, setLocations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCamera, setNewCamera] = useState({
    ip_address: '',
    resolution: '1920x1080 (1080p)',
    status: 'online',
    manufacturer: '',
    location_id: ''
  })
  const [modalError, setModalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [camerasRes, locationsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/v1/videos/cameras/list`),
        axios.get(`${BACKEND_URL}/api/v1/videos/locations/list`)
      ])
      const camsData = Array.isArray(camerasRes.data) ? camerasRes.data : []
      const locsData = Array.isArray(locationsRes.data) ? locationsRes.data : []
      setCameras(camsData)
      setLocations(locsData)
      if (locsData.length > 0) {
        setNewCamera(prev => ({ ...prev, location_id: locsData[0].id }))
      }
    } catch (err) {
      console.error('Error fetching cameras data:', err)
      setError('No se pudo conectar con el servidor SQL para listar las cámaras.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCamera(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    
    // IP pattern check
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(newCamera.ip_address)) {
      setModalError('Ingrese una dirección IPv4 válida (e.g. 192.168.10.51)')
      return
    }

    if (!newCamera.manufacturer.trim()) {
      setModalError('Ingrese el fabricante de la cámara.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/videos/cameras/add`, newCamera)
      setCameras(prev => [...prev, response.data])
      setShowAddModal(false)
      // Reset form
      setNewCamera({
        ip_address: '',
        resolution: '1920x1080 (1080p)',
        status: 'online',
        manufacturer: '',
        location_id: locations[0]?.id || ''
      })
    } catch (err) {
      console.error('Error adding camera:', err)
      setModalError('No se pudo registrar la cámara. Verifique la conexión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter cameras
  const filteredCameras = Array.isArray(cameras) ? cameras.filter(cam => {
    const locName = cam.location?.name?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return cam.ip_address.includes(query) || 
           cam.manufacturer?.toLowerCase().includes(query) || 
           locName.includes(query)
  }) : []

  // Get status badge info
  const getStatusBadge = (status) => {
    if (status === 'online') {
      return (
        <span className="cam-status-badge status-online">
          <CheckCircle size={12} /> ONLINE
        </span>
      )
    }
    if (status === 'offline') {
      return (
        <span className="cam-status-badge status-offline">
          <XCircle size={12} /> OFFLINE
        </span>
      )
    }
    return (
      <span className="cam-status-badge status-maintenance">
        <AlertCircle size={12} /> SOPORTE
      </span>
    )
  }

  return (
    <div className="cameras-page-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">📹</span>
          <h1 className="brand-title">Red<span>Cámaras</span></h1>
        </div>
        <p className="brand-subtitle">Control de equipamiento físico e inspección del estado de los flujos de video municipales</p>
      </header>

      {/* Control Actions Row */}
      <div className="cameras-controls-row animate-fade-in">
        <div className="search-wrap-cameras">
          <Search size={16} className="search-icon-cam" />
          <input 
            type="text" 
            placeholder="Buscar por IP, fabricante o intersección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-cam-field"
          />
        </div>

        <div className="actions-buttons-cam">
          <button className="btn-refresh-history" onClick={fetchData} title="Refrescar lista">
            <RefreshCw size={14} className={isLoading ? "spin-badge-icon" : ""} /> Actualizar
          </button>
          <button className="btn-primary btn-add-cam" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Registrar Cámara
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="glass-panel loader-box animate-fade-in">
          <RefreshCw className="spinner-icon-history" size={40} />
          <h3>Cargando Red de Dispositivos</h3>
          <p>Consultando catálogo de cámaras y vinculando ubicaciones viales...</p>
        </div>
      ) : error ? (
        <div className="glass-panel error-box animate-fade-in">
          <AlertCircle size={64} className="error-icon" />
          <h3>Error en la Red Vial</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchData}>Reintentar</button>
        </div>
      ) : filteredCameras.length === 0 ? (
        <div className="glass-panel empty-box animate-fade-in">
          <Camera size={64} className="success-icon" style={{ color: '#64748b' }} />
          <h3>Sin dispositivos</h3>
          <p>No se encontraron cámaras de seguridad vial que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="cameras-grid animate-fade-in">
          {filteredCameras.map((cam) => (
            <div key={cam.id} className="glass-panel camera-card-premium">
              <div className="cam-card-header">
                <div className="cam-title-wrap">
                  <Camera size={18} className="cam-decor-icon" />
                  <span className="cam-manufacturer">{cam.manufacturer || 'Generac'}</span>
                </div>
                {getStatusBadge(cam.status)}
              </div>

              <div className="cam-card-body">
                <div className="cam-metric-item">
                  <span className="metric-label-cam">DIRECCIÓN IP:</span>
                  <span className="metric-value-cam code-font">{cam.ip_address}</span>
                </div>
                <div className="cam-metric-item">
                  <span className="metric-label-cam">RESOLUCIÓN DE LENTE:</span>
                  <span className="metric-value-cam">{cam.resolution}</span>
                </div>
                <div className="cam-metric-item">
                  <span className="metric-label-cam">DISTRITO VIAL:</span>
                  <span className="metric-value-cam font-bold-cam">{cam.location?.district?.name || 'N/A'}</span>
                </div>
                <div className="cam-metric-item">
                  <span className="metric-label-cam">COORDENADAS VIALES:</span>
                  <span className="metric-value-cam code-font" style={{ fontSize: '0.75rem' }}>
                    {cam.location && cam.location.latitude ? `Lat: ${cam.location.latitude}, Lon: ${cam.location.longitude}` : 'N/A'}
                  </span>
                </div>
                <div className="cam-metric-item full-width-cam">
                  <span className="metric-label-cam"><MapPin size={11} style={{ marginRight: '4px' }} /> INTERSECCIÓN / PUNTO:</span>
                  <span className="metric-value-cam font-bold-cam">
                    {cam.location ? cam.location.name : 'No asignada'}
                  </span>
                </div>
              </div>

              <div className="cam-card-footer">
                <span className="feed-status-dot active"></span>
                <span className="feed-status-text">Capa de Visión Inteligente Activa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showAddModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel add-cam-modal-content animate-scale-up">
            <header className="modal-header">
              <h3>Registrar Nueva Cámara de Monitoreo</h3>
              <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="modal-form-cam">
              {modalError && (
                <div className="modal-error-banner">
                  <AlertCircle size={14} /> <span>{modalError}</span>
                </div>
              )}

              <div className="form-group-cam">
                <label className="form-label-cam">Dirección IP de la Cámara (IPv4):</label>
                <input 
                  type="text" 
                  name="ip_address"
                  placeholder="e.g. 192.168.10.55"
                  value={newCamera.ip_address}
                  onChange={handleInputChange}
                  className="form-input-cam"
                  required
                />
              </div>

              <div className="form-grid-two-cols">
                <div className="form-group-cam">
                  <label className="form-label-cam">Fabricante / Marca:</label>
                  <input 
                    type="text" 
                    name="manufacturer"
                    placeholder="e.g. Hikvision"
                    value={newCamera.manufacturer}
                    onChange={handleInputChange}
                    className="form-input-cam"
                    required
                  />
                </div>

                <div className="form-group-cam">
                  <label className="form-label-cam">Resolución Nativa:</label>
                  <select 
                    name="resolution"
                    value={newCamera.resolution}
                    onChange={handleInputChange}
                    className="form-select-cam"
                  >
                    <option value="1280x720 (720p)">1280x720 (720p)</option>
                    <option value="1920x1080 (1080p)">1920x1080 (1080p)</option>
                    <option value="2560x1440 (2K)">2560x1440 (2K)</option>
                    <option value="3840x2160 (4K)">3840x2160 (4K)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-two-cols">
                <div className="form-group-cam">
                  <label className="form-label-cam">Ubicación Vial / Intersección:</label>
                  <select 
                    name="location_id"
                    value={newCamera.location_id}
                    onChange={handleInputChange}
                    className="form-select-cam"
                    required
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-cam">
                  <label className="form-label-cam">Estado Inicial:</label>
                  <select 
                    name="status"
                    value={newCamera.status}
                    onChange={handleInputChange}
                    className="form-select-cam"
                  >
                    <option value="online">ONLINE</option>
                    <option value="offline">OFFLINE</option>
                    <option value="maintenance">SOPORTE</option>
                  </select>
                </div>
              </div>

              <footer className="modal-footer-cam">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Registrar Dispositivo'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CamerasRegistry
