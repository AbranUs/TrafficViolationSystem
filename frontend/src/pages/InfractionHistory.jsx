import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  FileText, 
  Printer, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  X,
  CreditCard,
  Sliders,
  DollarSign
} from 'lucide-react'
import './InfractionHistory.css'

const BACKEND_URL = 'http://localhost:8000'

function InfractionHistory() {
  const [infractions, setInfractions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchPlate, setSearchPlate] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [minConfidence, setMinConfidence] = useState(50) // 50% default
  
  // Lightboxes and modal state
  const [activeLightbox, setActiveLightbox] = useState(null)
  const [activeTicket, setActiveTicket] = useState(null)

  // Load fine values from localStorage or default
  const [fineRates, setFineRates] = useState({
    redLight: 250.00,
    uTurn: 150.00,
    crosswalk: 180.00
  })

  useEffect(() => {
    const savedRed = localStorage.getItem('settings_fine_red')
    const savedUturn = localStorage.getItem('settings_fine_uturn')
    const savedCrosswalk = localStorage.getItem('settings_fine_crosswalk')
    const savedMinConf = localStorage.getItem('settings_min_confidence')

    if (savedRed || savedUturn || savedCrosswalk) {
      setFineRates({
        redLight: parseFloat(savedRed || 250.00),
        uTurn: parseFloat(savedUturn || 150.00),
        crosswalk: parseFloat(savedCrosswalk || 180.00)
      })
    }
    if (savedMinConf) {
      setMinConfidence(parseInt(savedMinConf))
    }
  }, [])

  const fetchInfractions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/videos/all-infractions`, {
        params: {
          placa: searchPlate || undefined,
          tipo: selectedType || undefined
        }
      })
      setInfractions(response.data)
    } catch (err) {
      console.error('Error fetching infractions:', err)
      setError('Error al conectar con la base de datos de infracciones.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInfractions()
  }, [searchPlate, selectedType])

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
  }

  // Calculate dynamic fine cost based on violation type
  const getFineCost = (type) => {
    if (type === "Cruce de semáforo en rojo") return fineRates.redLight
    if (type === "Giro prohibido") return fineRates.uTurn
    if (type === "Invasión de paso peatonal") return fineRates.crosswalk
    return 100.00 // base default
  }

  // Handle printing citation
  const handlePrint = () => {
    window.print()
  }

  // Filter infractions in frontend by confidence slider on top of backend filters
  const filteredInfractions = infractions.filter(inf => 
    (inf.confianza * 100) >= minConfidence
  )

  return (
    <div className="history-page-container">
      {/* Header */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">📇</span>
          <h1 className="brand-title">Historial<span>Infracciones</span></h1>
        </div>
        <p className="brand-subtitle">Consulta de actas, búsquedas por placa o emisión de boletas de multa oficiales</p>
      </header>

      {/* Control Panel Filters */}
      <div className="glass-panel filters-section animate-fade-in">
        <div className="filters-grid">
          {/* Plate Search input */}
          <div className="filter-item">
            <label className="filter-label"><Search size={13} /> Buscar por Placa</label>
            <div className="filter-input-wrap">
              <input 
                type="text" 
                placeholder="Escriba la placa (e.g. ABC-1234)..."
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                className="filter-input"
              />
              {searchPlate && (
                <button className="clear-filter-btn" onClick={() => setSearchPlate('')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Type Filter dropdown */}
          <div className="filter-item">
            <label className="filter-label"><Filter size={13} /> Tipo de Multa</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="Cruce de semáforo en rojo">Semáforo en Rojo</option>
              <option value="Giro prohibido">Giro prohibido (en U)</option>
              <option value="Invasión de paso peatonal">Invasión de paso peatonal</option>
            </select>
          </div>

          {/* Confidence Slider filter */}
          <div className="filter-item">
            <label className="filter-label">
              <Sliders size={13} /> Certeza de IA Mínima: <strong style={{ color: '#8b5cf6' }}>{minConfidence}%</strong>
            </label>
            <div className="slider-wrapper">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={minConfidence} 
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                className="confidence-slider"
              />
            </div>
          </div>

          {/* Refresh action */}
          <div className="filter-action-wrap">
            <button className="btn-refresh-history" onClick={fetchInfractions} title="Actualizar datos">
              <RefreshCw size={14} className={isLoading ? "spin-badge-icon" : ""} /> Refrescar Base
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <main className="history-main-content">
        {isLoading ? (
          <div className="glass-panel loader-box animate-fade-in">
            <RefreshCw className="spinner-icon-history" size={40} />
            <h3>Consultando Base de Datos SQL</h3>
            <p>Filtrando registros de tránsito y vinculando evidencias...</p>
          </div>
        ) : error ? (
          <div className="glass-panel error-box animate-fade-in">
            <AlertTriangle size={64} className="error-icon" />
            <h3>Error al recuperar registros</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchInfractions}>Reintentar</button>
          </div>
        ) : filteredInfractions.length === 0 ? (
          <div className="glass-panel empty-box animate-fade-in">
            <CheckCircle size={64} className="success-icon" />
            <h3>No se encontraron infracciones</h3>
            <p>No hay multas registradas en la base de datos que coincidan con los filtros ingresados.</p>
          </div>
        ) : (
          <div className="glass-panel table-panel animate-fade-in">
            <div className="table-header-info">
              <span>Registros encontrados: <strong>{filteredInfractions.length}</strong></span>
            </div>
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Código Infracción</th>
                    <th>Tipo de Infracción</th>
                    <th>Placa Detectada</th>
                    <th>Segundo de Video</th>
                    <th>Confianza IA</th>
                    <th>Costo Estimado</th>
                    <th style={{ textAlign: 'center' }}>Acciones Administrativas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInfractions.map((inf) => {
                    let rowClass = "badge-gray"
                    if (inf.tipo === "Cruce de semáforo en rojo") rowClass = "badge-red"
                    if (inf.tipo === "Giro prohibido") rowClass = "badge-violet"
                    if (inf.tipo === "Invasión de paso peatonal") rowClass = "badge-orange"

                    const fineAmount = getFineCost(inf.tipo)

                    return (
                      <tr key={inf.id}>
                        <td className="code-font code-col">{inf.id}</td>
                        <td>
                          <span className={`violation-badge ${rowClass}`}>{inf.tipo}</span>
                        </td>
                        <td>
                          <span className="plate-badge-bold">{inf.placa_vehiculo || 'No detectada'}</span>
                        </td>
                        <td className="code-font"><Clock size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{formatSeconds(inf.timestamp)}</td>
                        <td className="code-font font-bold">
                          {Math.round(inf.confianza * 100)}%
                        </td>
                        <td className="code-font currency-text">
                          ${fineAmount.toFixed(2)}
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              className="btn-action-view"
                              onClick={() => setActiveLightbox(inf)}
                              title="Ver Captura de OpenCV"
                            >
                              <Eye size={12} /> Evidencia
                            </button>
                            <button 
                              className="btn-action-ticket"
                              onClick={() => setActiveTicket(inf)}
                              title="Generar Boleta de Infracción"
                            >
                              <FileText size={12} /> Emitir Multa
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox for Evidence Frame */}
      {activeLightbox && (
        <div className="modal-overlay animate-fade-in" onClick={() => setActiveLightbox(null)}>
          <div className="modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Fotograma de Evidencia Física</h3>
              <button className="btn-close-modal" onClick={() => setActiveLightbox(null)}>
                <X size={18} />
              </button>
            </header>
            
            <div className="modal-body">
              <div className="evidence-frame-container">
                <img 
                  src={`${BACKEND_URL}/uploads/frames/${activeLightbox.id}.jpg`} 
                  alt="Fotograma destacado"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE TICKET CITATION MODAL */}
      {activeTicket && (
        <div className="modal-overlay animate-fade-in ticket-modal-overlay" onClick={() => setActiveTicket(null)}>
          <div className="modal-content ticket-modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {/* Ticket wrapper (for clean print selection) */}
            <div id="printable-ticket" className="citation-ticket">
              <div className="ticket-border-decoration"></div>
              
              <div className="ticket-header">
                <span className="ticket-emblem">🚦</span>
                <div className="ticket-entity-title">
                  <h2>ACTA DE INFRACCIÓN DE TRÁNSITO</h2>
                  <h3>SISTEMA DIGITAL DE CONTROL DE CONTROLVIAL</h3>
                  <p>Policía de Tránsito y Seguridad Vial - Reporte Oficial</p>
                </div>
              </div>

              <div className="ticket-body">
                <div className="ticket-section-title">DETALLES DEL INCIDENTE</div>
                <div className="ticket-grid">
                  <div className="ticket-cell">
                    <span className="cell-label">CÓDIGO DE ACTA:</span>
                    <span className="cell-val code-font">{activeTicket.id}</span>
                  </div>
                  <div className="ticket-cell">
                    <span className="cell-label">FECHA DE CONTROL:</span>
                    <span className="cell-val">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="ticket-cell">
                    <span className="cell-label">MARCA DE TIEMPO (VIDEO):</span>
                    <span className="cell-val code-font">Segundo {formatSeconds(activeTicket.timestamp)}</span>
                  </div>
                  <div className="ticket-cell flex-full">
                    <span className="cell-label">TIPO DE INFRACCIÓN:</span>
                    <span className="cell-val val-violation-type">{activeTicket.tipo.toUpperCase()}</span>
                  </div>
                </div>

                <div className="ticket-section-title" style={{ marginTop: '1.25rem' }}>DATOS DEL VEHÍCULO INFRACTOR</div>
                <div className="ticket-grid">
                  <div className="ticket-cell">
                    <span className="cell-label">NÚMERO DE MATRÍCULA (PLACA):</span>
                    <span className="cell-val val-plate">{activeTicket.placa_vehiculo || 'NO IDENTIFICADA'}</span>
                  </div>
                  <div className="ticket-cell">
                    <span className="cell-label">CERTEZA DETECCIÓN (IA):</span>
                    <span className="cell-val">{Math.round(activeTicket.confianza * 100)}%</span>
                  </div>
                  <div className="ticket-cell flex-full">
                    <span className="cell-label">DESCRIPCIÓN OPERATIVA:</span>
                    <span className="cell-val font-normal">{activeTicket.descripcion}</span>
                  </div>
                </div>

                <div className="ticket-section-title" style={{ marginTop: '1.25rem' }}>REGISTRO FOTOGRÁFICO (EVIDENCIA DE IA)</div>
                <div className="ticket-evidence-photo">
                  <img 
                    src={`${BACKEND_URL}/uploads/frames/${activeTicket.id}.jpg`} 
                    alt="Evidencia fotográfica oficial"
                    className="evidence-photo-img"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1545641203-7d6cf941d255?q=80&w=640&auto=format&fit=crop'
                    }}
                  />
                  <div className="photo-stamp">COGNITIVE COMPUTER VISION - OPENCV + YOLO</div>
                </div>

                <div className="ticket-fine-summary">
                  <div className="fine-title">LIQUIDACIÓN DE SANCIÓN ECONÓMICA</div>
                  <div className="fine-value-row">
                    <span>Monto de Multa Administrativa:</span>
                    <strong className="code-font">${getFineCost(activeTicket.tipo).toFixed(2)} USD</strong>
                  </div>
                  <p className="fine-notice">Nota: Esta boleta ha sido generada automáticamente mediante el procesamiento digital de la cámara de seguridad vial. Los registros geométricos y de confianza satisfacen los estándares regulatorios vigentes.</p>
                </div>

                <div className="ticket-footer-signatures">
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <span>Sello Autoridad de Control</span>
                  </div>
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <span>Firma Administrativa IA</span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="ticket-modal-actions no-print">
              <button className="btn-secondary" onClick={() => setActiveTicket(null)}>
                Cerrar Ventana
              </button>
              <button className="btn-primary btn-print-ticket" onClick={handlePrint}>
                <Printer size={14} /> Imprimir Boleta de Multa
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfractionHistory
