import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Printer,
  X,
  CreditCard,
  FileQuestion,
  RefreshCw
} from 'lucide-react'
import './CitizenSearch.css'

const BACKEND_URL = 'http://localhost:8000'

function CitizenSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState('')

  // Modals state
  const [activeEvidence, setActiveEvidence] = useState(null)
  const [activeTicket, setActiveTicket] = useState(null)
  const [appealModal, setAppealModal] = useState(null) // holds citation object if open
  const [appealReason, setAppealReason] = useState('')
  const [appealSubmitting, setAppealSubmitting] = useState(false)

  // Fine rates load from localStorage for ticket pricing consistency
  const [fineRates, setFineRates] = useState({
    redLight: 250.00,
    uTurn: 150.00,
    crosswalk: 180.00
  })

  useEffect(() => {
    const savedRed = localStorage.getItem('settings_fine_red')
    const savedUturn = localStorage.getItem('settings_fine_uturn')
    const savedCrosswalk = localStorage.getItem('settings_fine_crosswalk')
    if (savedRed || savedUturn || savedCrosswalk) {
      setFineRates({
        redLight: parseFloat(savedRed || 250.00),
        uTurn: parseFloat(savedUturn || 150.00),
        crosswalk: parseFloat(savedCrosswalk || 180.00)
      })
    }
  }, [])

  // Auto-search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoadingResults(true)
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/videos/citizens/search`, {
          params: { query: searchQuery }
        })
        setSearchResults(response.data)
      } catch (err) {
        console.error('Error searching citizens:', err)
      } finally {
        setIsLoadingResults(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelectOwner = async (owner) => {
    setSelectedOwner(owner)
    setSearchResults([])
    setSearchQuery('')
    setIsLoadingDetail(true)
    setError('')
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/videos/citizens/detail/${owner.owner_id}`)
      setDetailData(response.data)
    } catch (err) {
      console.error('Error loading owner details:', err)
      setError('No se pudieron recuperar los detalles del propietario.')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleAppealSubmit = async (e) => {
    e.preventDefault()
    if (!appealReason.trim()) return
    
    setIsAppealSubmitting(true)
    // Simulate API appeal request
    setTimeout(() => {
      // Update local state to reflect the appeal
      setDetailData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          citations: prev.citations.map(cit => {
            if (cit.citation_id === appealModal.citation_id) {
              return { ...cit, status: 'apelada' }
            }
            return cit
          })
        }
      })
      alert('Apelación encolada correctamente. Será revisada por la Dirección de Seguridad Vial.')
      setAppealModal(null)
      setAppealReason('')
      setIsAppealSubmitting(false)
    }, 1200)
  }

  const getStatusBadge = (status) => {
    if (status === 'pagada') {
      return <span className="citation-status-badge status-paid"><CheckCircle size={11} /> PAGADA</span>
    }
    if (status === 'pendiente') {
      return <span className="citation-status-badge status-pending"><Clock size={11} /> PENDIENTE</span>
    }
    if (status === 'apelada') {
      return <span className="citation-status-badge status-appealed"><FileQuestion size={11} /> APELADA</span>
    }
    return <span className="citation-status-badge status-expired"><XCircle size={11} /> VENCIDA</span>
  }

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
  }

  const getFineCost = (type, databaseAmount) => {
    // If customized in settings, use setting rate, else fall back to database stored amount
    if (type === "Cruce de semáforo en rojo") return fineRates.redLight
    if (type === "Giro prohibido") return fineRates.uTurn
    if (type === "Invasión de paso peatonal") return fineRates.crosswalk
    return databaseAmount
  }

  const getPointDeduction = (type) => {
    if (type === "Cruce de semáforo en rojo") return 5
    if (type === "Giro prohibido") return 3
    if (type === "Invasión de paso peatonal") return 2
    return 0
  }

  return (
    <div className="citizen-page-container">
      {/* Header */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">👥</span>
          <h1 className="brand-title">Consulta<span>Ciudadana</span></h1>
        </div>
        <p className="brand-subtitle">Buscador unificado de propietarios de vehículos, parque vehicular y registro de multas asociadas</p>
      </header>

      {/* SEARCH BAR SECTION */}
      <div className="citizen-search-row animate-fade-in">
        <div className="search-box-citizen">
          <Search size={18} className="search-icon-citizen" />
          <input 
            type="text" 
            placeholder="Buscar por Nombre del Propietario o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-citizen-field"
          />
          {isLoadingResults && (
            <div className="search-loader">
              <RefreshCw size={14} className="spin-badge-icon" />
            </div>
          )}
        </div>

        {/* Dropdown list results */}
        {searchResults.length > 0 && (
          <div className="search-results-dropdown glass-panel">
            {searchResults.map((owner) => (
              <button 
                key={owner.owner_id}
                className="result-dropdown-item"
                onClick={() => handleSelectOwner(owner)}
              >
                <User size={14} style={{ color: '#8b5cf6' }} />
                <div className="item-text-wrapper">
                  <span className="owner-dropdown-name">{owner.full_name}</span>
                  <span className="owner-dropdown-id">ID: {owner.owner_id}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MAIN LAYOUT BLOCK */}
      <main className="citizen-main-content">
        
        {/* State A: Idle (No selection) */}
        {!selectedOwner && !isLoadingDetail && (
          <div className="glass-panel card-idle-citizen animate-fade-in">
            <User size={64} className="idle-decor-icon-citizen animate-pulse" />
            <h3>Consulta de Registro de Tránsito</h3>
            <p>Escriba el nombre o documento nacional de identidad en el buscador superior para cargar la ficha del propietario, ver sus automóviles patentados e inspeccionar citaciones oficiales viales.</p>
          </div>
        )}

        {/* State B: Loading details */}
        {isLoadingDetail && (
          <div className="glass-panel card-loader-citizen animate-fade-in">
            <RefreshCw className="spinner-icon-citizen" size={40} />
            <h3>Recuperando Ficha en Servidor SQL</h3>
            <p>Cruzando base de datos de vehículos registrados, llaves relacionales e historial de pagos...</p>
          </div>
        )}

        {/* State C: Error details */}
        {error && (
          <div className="glass-panel card-error-citizen animate-fade-in">
            <AlertTriangle size={64} className="error-icon-citizen" />
            <h3>Ficha no recuperada</h3>
            <p>{error}</p>
          </div>
        )}

        {/* State D: Detail View loaded successfully */}
        {!isLoadingDetail && !error && detailData && (
          <div className="citizen-details-grid animate-fade-in">
            
            {/* COLUMN 1: PROPRIETARIO PROFILE CARD */}
            <div className="citizen-profile-section">
              <div className="glass-panel profile-card">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar">
                    {detailData.owner.full_name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <h2 className="profile-name">{detailData.owner.full_name}</h2>
                <span className="profile-id-tag">DNI: {detailData.owner.owner_id}</span>

                <div className="profile-contact-details">
                  <div className="contact-item">
                    <MapPin size={14} className="contact-icon" />
                    <span>{detailData.owner.address || 'No registrado'}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} className="contact-icon" />
                    <span>{detailData.owner.telephone || 'No registrado'}</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={14} className="contact-icon" />
                    <span>{detailData.owner.email || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              {/* VEHICLES SECTION */}
              <div className="citizen-vehicles-card-wrap">
                <h3 className="section-title-citizen">Vehículos Patentados ({detailData.vehicles.length})</h3>
                {detailData.vehicles.length === 0 ? (
                  <div className="glass-panel empty-subcard">
                    <Car size={24} style={{ color: '#64748b', marginBottom: '0.5rem' }} />
                    <p>No registra vehículos patentados.</p>
                  </div>
                ) : (
                  <div className="vehicles-list-flex">
                    {detailData.vehicles.map((veh) => (
                      <div key={veh.plate_number} className="glass-panel vehicle-subcard">
                        <div className="vehicle-header">
                          <Car size={16} className="car-icon-badge" />
                          <span className="vehicle-brand">{veh.brand} {veh.model}</span>
                        </div>
                        <div className="vehicle-details-row">
                          <div className="vehicle-metric">
                            <span className="v-lbl">PLACA:</span>
                            <span className="v-val badge-plate-citizen">{veh.plate_number}</span>
                          </div>
                          <div className="vehicle-metric">
                            <span className="v-lbl">COLOR:</span>
                            <span className="v-val">{veh.color || 'N/A'}</span>
                          </div>
                          <div className="vehicle-metric">
                            <span className="v-lbl">TIPO:</span>
                            <span className="v-val text-capitalize">{veh.vehicle_type}</span>
                          </div>
                          <div className="vehicle-metric">
                            <span className="v-lbl">REGISTRO:</span>
                            <span className="v-val">{veh.registration_date ? new Date(veh.registration_date).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: CITATIONS AND SANCTIONS */}
            <div className="citizen-citations-section">
              <h3 className="section-title-citizen">Registro de Multas y Sanciones ({detailData.citations.length})</h3>
              
              {detailData.citations.length === 0 ? (
                <div className="glass-panel clean-citizen-card">
                  <CheckCircle size={48} className="clean-citizen-icon" />
                  <h4>Buen Comportamiento Vial</h4>
                  <p>Este ciudadano no registra deudas ni citaciones pendientes en el sistema de seguridad de tránsito.</p>
                </div>
              ) : (
                <div className="citations-list-citizen">
                  {detailData.citations.map((cit) => {
                    const fineAmount = getFineCost(cit.infraction?.tipo, cit.fine_amount)

                    return (
                      <div key={cit.citation_id} className="glass-panel citation-card-premium">
                        <div className="citation-header-row">
                          <div className="citation-meta-top">
                            <span className="citation-id-text font-bold code-font">{cit.citation_id}</span>
                            <span className="citation-date"><Clock size={11} /> {new Date(cit.issue_date).toLocaleDateString()}</span>
                          </div>
                          {getStatusBadge(cit.status)}
                        </div>

                        <div className="citation-body-content">
                          <div className="citation-type-label">
                            {cit.infraction ? cit.infraction.tipo : 'Multa Administrativa'}
                          </div>
                          <p className="citation-desc">
                            {cit.infraction ? cit.infraction.descripcion : 'Infracción vial procesada.'}
                          </p>

                          <div className="citation-metrics-inline">
                            <div className="c-metric">
                              <span className="c-lbl">Vehículo:</span>
                              <span className="c-val">{cit.plate_number}</span>
                            </div>
                            <div className="c-metric">
                              <span className="c-lbl">Fecha Vto:</span>
                              <span className="c-val">{new Date(cit.due_date).toLocaleDateString()}</span>
                            </div>
                            <div className="c-metric">
                              <span className="c-lbl">Puntos Licencia:</span>
                              <span className="c-val" style={{ color: '#fca5a5', fontWeight: '600' }}>-{getPointDeduction(cit.infraction?.tipo)} pts</span>
                            </div>
                            <div className="c-metric">
                              <span className="c-lbl">Sanción:</span>
                              <span className="c-val color-gold font-bold">${fineAmount.toFixed(2)} USD</span>
                            </div>
                          </div>

                          {cit.status === 'pagada' && cit.payments && cit.payments.length > 0 && (
                            <div className="citation-payment-details-box" style={{
                              marginTop: '0.75rem',
                              padding: '0.6rem 0.85rem',
                              background: 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid rgba(16, 185, 129, 0.15)',
                              borderRadius: '6px',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ fontWeight: '700', color: '#34d399', marginBottom: '0.25rem' }}>DETALLE DEL PAGO REGISTRADO:</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                                <div><strong>ID Pago:</strong> <span className="code-font">{cit.payments[0].payment_id}</span></div>
                                <div><strong>Fecha Pago:</strong> {new Date(cit.payments[0].payment_date).toLocaleString()}</div>
                                <div><strong>Método:</strong> {cit.payments[0].payment_method === 'credit_card' ? 'Tarj. Crédito' : cit.payments[0].payment_method}</div>
                                <div><strong>Nro Transacción:</strong> <span className="code-font">{cit.payments[0].transaction_number}</span></div>
                              </div>
                            </div>
                          )}

                          {cit.status === 'apelada' && cit.appeals && cit.appeals.length > 0 && (
                            <div className="citation-appeal-details-box" style={{
                              marginTop: '0.75rem',
                              padding: '0.6rem 0.85rem',
                              background: 'rgba(56, 189, 248, 0.05)',
                              border: '1px solid rgba(56, 189, 248, 0.15)',
                              borderRadius: '6px',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ fontWeight: '700', color: '#38bdf8', marginBottom: '0.25rem' }}>HISTORIAL DE APELACIÓN:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div><strong>ID Apelación:</strong> <span className="code-font">{cit.appeals[0].appeal_id}</span></div>
                                <div><strong>Fecha Solicitud:</strong> {new Date(cit.appeals[0].appeal_date).toLocaleString()}</div>
                                <div><strong>Motivo de Descargo:</strong> <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>"{cit.appeals[0].reason}"</span></div>
                                <div><strong>Resolución:</strong> <span style={{ textTransform: 'uppercase', color: '#38bdf8', fontWeight: '700' }}>{cit.appeals[0].status === 'en_proceso' ? 'En Proceso de Revisión' : cit.appeals[0].status}</span></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="citation-footer-actions">
                          {/* Ver evidencia lightbox */}
                          {cit.infraction && (
                            <button 
                              className="btn-action-view"
                              onClick={() => setActiveEvidence(cit.infraction)}
                              title="Ver Captura de Evidencia"
                            >
                              Ver Foto
                            </button>
                          )}
                          
                          {/* Generar ticket de multa */}
                          {cit.infraction && (
                            <button 
                              className="btn-action-ticket"
                              onClick={() => {
                                // Inject active dynamic fine amount for the printable ticket
                                const citationWithUpdatedFine = {
                                  ...cit.infraction,
                                  fine_amount_custom: fineAmount
                                }
                                setActiveTicket(citationWithUpdatedFine)
                              }}
                              title="Imprimir Boleta de Citación"
                            >
                              <Printer size={12} /> Boleta
                            </button>
                          )}

                          {/* Apelar multa si está pendiente */}
                          {cit.status === 'pendiente' && (
                            <button 
                              className="btn-appeal-citation"
                              onClick={() => setAppealModal(cit)}
                              title="Presentar apelación formal"
                            >
                              Apelar Multa
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* LIGHTBOX EVIDENCE MODAL */}
      {activeEvidence && (
        <div className="modal-overlay animate-fade-in" onClick={() => setActiveEvidence(null)}>
          <div className="modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Captura de Evidencia de Infracción</h3>
              <button className="btn-close-modal" onClick={() => setActiveEvidence(null)}>
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <div className="evidence-frame-container">
                <img 
                  src={`${BACKEND_URL}/uploads/frames/${activeEvidence.id}.jpg`} 
                  alt="Evidencia fotográfica"
                  className="evidence-frame-image"
                  onError={(e) => {
                    e.target.onerror = null
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
                    <span className="item-label">Placa de Vehículo</span>
                    <span className="item-value plate-box">{activeEvidence.placa_vehiculo || 'NO DETECTADA'}</span>
                  </div>
                  <div className="evidence-metric-item">
                    <span className="item-label">Certeza de IA</span>
                    <span className="item-value">{Math.round(activeEvidence.confianza * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE CITATION TICKET MODAL */}
      {activeTicket && (
        <div className="modal-overlay animate-fade-in ticket-modal-overlay" onClick={() => setActiveTicket(null)}>
          <div className="modal-content ticket-modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div id="printable-ticket" className="citation-ticket">
              <div className="ticket-border-decoration"></div>
              
              <div className="ticket-header">
                <span className="ticket-emblem">🚦</span>
                <div className="ticket-entity-title">
                  <h2>ACTA DE INFRACCIÓN DE TRÁNSITO</h2>
                  <h3>SISTEMA DIGITAL DE CONTROL DE CONTROLVIAL</h3>
                  <p>Dirección General de Seguridad Vial - Reporte Oficial de Propietario</p>
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

                <div className="ticket-section-title" style={{ marginTop: '1.25rem' }}>DATOS DEL VEHÍCULO INFRACTOR Y PROPIETARIO</div>
                <div className="ticket-grid">
                  <div className="ticket-cell">
                    <span className="cell-label">MATRÍCULA DE VEHÍCULO:</span>
                    <span className="cell-val val-plate">{activeTicket.placa_vehiculo || 'NO IDENTIFICADA'}</span>
                  </div>
                  <div className="ticket-cell">
                    <span className="cell-label">TITULAR REGISTRADO:</span>
                    <span className="cell-val">{detailData.owner.full_name}</span>
                  </div>
                  <div className="ticket-cell flex-full">
                    <span className="cell-label">DESCRIPCIÓN DE IA:</span>
                    <span className="cell-val font-normal">{activeTicket.descripcion}</span>
                  </div>
                </div>

                <div className="ticket-section-title" style={{ marginTop: '1.25rem' }}>EVIDENCIA FOTOGRÁFICA DE IA</div>
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
                  <div className="photo-stamp">COMPUTER VISION ENGINE - OPENCV + YOLO</div>
                </div>

                <div className="ticket-fine-summary">
                  <div className="fine-title">LIQUIDACIÓN DE SANCIÓN ECONÓMICA</div>
                  <div className="fine-value-row">
                    <span>Monto de Multa Administrativa:</span>
                    <strong className="code-font">${activeTicket.fine_amount_custom ? activeTicket.fine_amount_custom.toFixed(2) : '150.00'} USD</strong>
                  </div>
                  <p className="fine-notice">Esta citación ha sido vinculada debidamente al DNI {detailData.owner.owner_id} del propietario responsable. Los costos se basan en el tarifario vial configurado en producción.</p>
                </div>

                <div className="ticket-footer-signatures">
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <span>Sello Municipalidad</span>
                  </div>
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <span>Firma Auditor de IA</span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="ticket-modal-actions no-print">
              <button className="btn-secondary" onClick={() => setActiveTicket(null)}>
                Cerrar
              </button>
              <button className="btn-primary btn-print-ticket" onClick={handlePrint}>
                <Printer size={14} /> Imprimir Boleta de Multa
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* APELAR MULTA MODAL (SIMULATED FORM) */}
      {appealModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setAppealModal(null)}>
          <div className="modal-content glass-panel appeal-modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Presentar Apelación de Citación</h3>
              <button className="btn-close-modal" onClick={() => setAppealModal(null)}>
                <X size={18} />
              </button>
            </header>
            
            <form onSubmit={handleAppealSubmit} className="appeal-form">
              <div className="appeal-meta-details">
                <div>Código Multa: <strong className="code-font">{appealModal.citation_id}</strong></div>
                <div>Vehículo: <strong>{appealModal.plate_number}</strong></div>
                <div>Monto Sanción: <strong>${getFineCost(appealModal.infraction?.tipo, appealModal.fine_amount).toFixed(2)} USD</strong></div>
              </div>

              <div className="form-group-appeal">
                <label className="form-label-appeal">Motivo de Descargo / Justificación de Apelación:</label>
                <textarea 
                  rows="5"
                  placeholder="Describa de forma clara y detallada la justificación para apelar esta multa viales (ej. paso de ambulancia, señalización en mantenimiento, etc.)..."
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  className="appeal-textarea"
                  required
                />
              </div>

              <footer className="modal-footer-cam">
                <button type="button" className="btn-secondary" onClick={() => setAppealModal(null)}>
                  Cerrar
                </button>
                <button type="submit" className="btn-primary" disabled={isAppealSubmitting}>
                  {isAppealSubmitting ? 'Registrando Apelación...' : 'Enviar Apelación'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CitizenSearch
