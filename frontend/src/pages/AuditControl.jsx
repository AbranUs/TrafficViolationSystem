import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  ShieldAlert, 
  Users, 
  Cpu, 
  Terminal, 
  Clock, 
  CheckCircle,
  Database,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Sliders,
  Calendar
} from 'lucide-react'
import './AuditControl.css'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AuditControl() {
  const [activeSubTab, setActiveSubTab] = useState('officers') // 'officers', 'ai', 'logs'
  
  // Data States
  const [officers, setOfficers] = useState([])
  const [aiModels, setAiModels] = useState([])
  const [jobs, setJobs] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  
  // UI States
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeJobLogs, setActiveJobLogs] = useState(null) // holds logs text to show in console

  // Filter States
  const [officerSearch, setOfficerSearch] = useState('')
  const [logSearch, setLogSearch] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (activeSubTab === 'officers') {
        const response = await axios.get(`${BACKEND_URL}/api/v1/videos/officers/list`)
        setOfficers(response.data)
      } else if (activeSubTab === 'ai') {
        const [modelsRes, jobsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/v1/videos/ai-models/list`),
          axios.get(`${BACKEND_URL}/api/v1/videos/processing-jobs/list`)
        ])
        setAiModels(modelsRes.data)
        setJobs(jobsRes.data)
        if (jobsRes.data.length > 0 && !activeJobLogs) {
          setActiveJobLogs(jobsRes.data[0])
        }
      } else if (activeSubTab === 'logs') {
        const response = await axios.get(`${BACKEND_URL}/api/v1/videos/audit-logs/list`)
        setAuditLogs(response.data)
      }
    } catch (err) {
      console.error('Error fetching audit details:', err)
      setError('Error al recuperar registros de control vial desde el servidor relacional.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeSubTab])

  // Filtered officers list
  const filteredOfficers = officers.filter(off => 
    off.name.toLowerCase().includes(officerSearch.toLowerCase()) || 
    off.badge_number.includes(officerSearch) || 
    (off.rank && off.rank.toLowerCase().includes(officerSearch.toLowerCase()))
  )

  // Filtered audit logs list
  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
    log.table_name.toLowerCase().includes(logSearch.toLowerCase()) || 
    (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()))
  )

  return (
    <div className="audit-page-container">
      {/* Header */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">👮</span>
          <h1 className="brand-title">Control<span>Operativo</span></h1>
        </div>
        <p className="brand-subtitle">Panel administrativo de auditoría de transacciones, guardia de personal vial y registro técnico de IA</p>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="audit-tabs-navbar animate-fade-in">
        <button 
          onClick={() => setActiveSubTab('officers')}
          className={`audit-tab-btn ${activeSubTab === 'officers' ? 'active-audit-tab' : ''}`}
        >
          <Users size={14} /> Personal y Guardia Vial
        </button>
        <button 
          onClick={() => setActiveSubTab('ai')}
          className={`audit-tab-btn ${activeSubTab === 'ai' ? 'active-audit-tab' : ''}`}
        >
          <Cpu size={14} /> Modelos e Historial de IA
        </button>
        <button 
          onClick={() => setActiveSubTab('logs')}
          className={`audit-tab-btn ${activeSubTab === 'logs' ? 'active-audit-tab' : ''}`}
        >
          <Database size={14} /> Bitácora de Auditoría
        </button>

        <button className="btn-refresh-history btn-audit-refresh" onClick={fetchData} title="Refrescar datos">
          <RefreshCw size={12} className={isLoading ? "spin-badge-icon" : ""} /> Refrescar
        </button>
      </div>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="audit-main-content">
        {isLoading ? (
          <div className="glass-panel loader-box animate-fade-in">
            <RefreshCw className="spinner-icon-history" size={40} />
            <h3>Recuperando Bitácora Oficial</h3>
            <p>Conectando con base de datos SQL y compilando logs históricos...</p>
          </div>
        ) : error ? (
          <div className="glass-panel error-box animate-fade-in">
            <ShieldAlert size={64} className="error-icon" />
            <h3>Error de Conexión</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchData}>Reintentar</button>
          </div>
        ) : (
          <>
            {/* SUB-TAB 1: OFFICERS SHIFTS & ASSIGNMENTS */}
            {activeSubTab === 'officers' && (
              <div className="audit-view-grid animate-fade-in">
                <div className="glass-panel search-section-panel audit-controls-bar">
                  <div className="search-wrap-cameras">
                    <Search size={16} className="search-icon-cam" />
                    <input 
                      type="text" 
                      placeholder="Buscar por placa de agente, nombre o rango..."
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      className="search-input-cam-field"
                    />
                  </div>
                  <span className="results-counter">Agentes en servicio: <strong>{filteredOfficers.length}</strong></span>
                </div>

                {filteredOfficers.length === 0 ? (
                  <div className="glass-panel empty-box">
                    <Users size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
                    <h4>Sin Agentes de Guardia</h4>
                    <p>No se encontraron oficiales de seguridad vial registrados en este período.</p>
                  </div>
                ) : (
                  <div className="glass-panel table-panel">
                    <div className="table-wrapper">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>Nro Placa</th>
                            <th>Nombre del Agente</th>
                            <th>Rango</th>
                            <th>Distrito de Patrulla</th>
                            <th>Inicio Turno</th>
                            <th>Fin Turno</th>
                            <th>Estado Operacional</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOfficers.map((off) => (
                            <tr key={off.badge_number}>
                              <td className="code-font font-bold">{off.badge_number}</td>
                              <td>{off.name}</td>
                              <td>{off.rank || 'N/A'}</td>
                              <td>
                                <span className="plate-badge-bold">{off.district ? off.district.name : 'No asignado'}</span>
                              </td>
                              <td className="code-font">
                                <Clock size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                {off.assignments.length > 0 && off.assignments[0].shift_start 
                                  ? new Date(off.assignments[0].shift_start).toLocaleTimeString() 
                                  : 'N/A'}
                              </td>
                              <td className="code-font">
                                <Clock size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                {off.assignments.length > 0 && off.assignments[0].shift_end 
                                  ? new Date(off.assignments[0].shift_end).toLocaleTimeString() 
                                  : 'N/A'}
                              </td>
                              <td>
                                <span className="feed-status-dot active"></span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>PATRULLANDO</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: AI MODELS AND PROCESSING LOGS */}
            {activeSubTab === 'ai' && (
              <div className="ai-audit-layout animate-fade-in">
                {/* 1. Catálogo Modelos IA */}
                <div className="ai-models-catalog">
                  <h3 className="section-title-citizen" style={{ marginBottom: '1rem' }}><Cpu size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Catálogo de Modelos Activos</h3>
                  <div className="ai-models-grid">
                    {aiModels.map((model) => (
                      <div key={model.id} className="glass-panel ai-model-card">
                        <div className="model-header">
                          <Cpu size={18} className="icon-indigo" />
                          <span className="model-name-text">{model.name}</span>
                        </div>
                        <div className="model-body">
                          <div><strong>Versión:</strong> <span className="code-font">{model.version}</span></div>
                          <div><strong>Precisión Inferencia:</strong> <strong style={{ color: '#34d399' }}>{Math.round(model.accuracy_score * 100)}%</strong></div>
                          <div><strong>Fecha Registro:</strong> {model.trained_at ? new Date(model.trained_at).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Cola de Trabajos de Inferencia y Visor de Consola */}
                <div className="ai-jobs-and-console-grid">
                  {/* Lista de trabajos */}
                  <div className="ai-jobs-list-panel">
                    <h3 className="section-title-citizen" style={{ marginBottom: '1rem' }}><Clock size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Historial de Procesamientos</h3>
                    <div className="jobs-scroller">
                      {jobs.map((job) => {
                        const isActive = activeJobLogs && activeJobLogs.id === job.id
                        return (
                          <button 
                            key={job.id}
                            className={`glass-panel job-item-btn ${isActive ? 'active-job-btn' : ''}`}
                            onClick={() => setActiveJobLogs(job)}
                          >
                            <div className="job-item-header">
                              <span className="job-id-text font-bold code-font">Trabajo: {job.id.substring(0, 8)}...</span>
                              <span className={`citation-status-badge ${job.status === 'completado' ? 'status-paid' : 'status-expired'}`}>{job.status}</span>
                            </div>
                            <div className="job-item-footer text-left">
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Inicio: {new Date(job.start_time).toLocaleString()}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Consola de logs */}
                  <div className="ai-console-logs-panel">
                    <h3 className="section-title-citizen" style={{ marginBottom: '1rem' }}><Terminal size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Consola de Inferencia de IA</h3>
                    <div className="console-box">
                      <div className="console-header">
                        <span className="console-dot-decor red"></span>
                        <span className="console-dot-decor yellow"></span>
                        <span className="console-dot-decor green"></span>
                        <span className="console-title-text">terminal_output.log</span>
                      </div>
                      <div className="console-body">
                        {activeJobLogs ? (
                          <pre className="console-pre-text">
                            {activeJobLogs.logs}
                          </pre>
                        ) : (
                          <pre className="console-pre-text">
                            [SISTEMA] Seleccione un trabajo de procesamiento de la lista para cargar la bitácora técnica de inferencia...
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: SYSTEM AUDIT LOGS */}
            {activeSubTab === 'logs' && (
              <div className="audit-view-grid animate-fade-in">
                <div className="glass-panel search-section-panel audit-controls-bar">
                  <div className="search-wrap-cameras">
                    <Search size={16} className="search-icon-cam" />
                    <input 
                      type="text" 
                      placeholder="Filtrar por acción realizada o tabla afectada..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="search-input-cam-field"
                    />
                  </div>
                  <span className="results-counter">Registros de auditoría: <strong>{filteredLogs.length}</strong></span>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="glass-panel empty-box">
                    <Database size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
                    <h4>Sin Registros de Auditoría</h4>
                    <p>No se encontraron logs que coincidan con la búsqueda.</p>
                  </div>
                ) : (
                  <div className="glass-panel table-panel">
                    <div className="table-wrapper">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>ID Log</th>
                            <th>Usuario Responsable</th>
                            <th>Acción</th>
                            <th>Tablas Afectadas</th>
                            <th>Detalle Técnico del Cambio</th>
                            <th>Fecha Registro (TIMESTAMP)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.map((log) => (
                            <tr key={log.log_id}>
                              <td className="code-font code-col">{log.log_id}</td>
                              <td className="code-font font-bold">admin_user</td>
                              <td>
                                <span className="violation-badge badge-violet">{log.action}</span>
                              </td>
                              <td className="code-font">{log.table_name}</td>
                              <td className="log-details-cell" title={log.details}>{log.details}</td>
                              <td className="code-font">
                                <Calendar size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default AuditControl
