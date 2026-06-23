import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Database, 
  TrendingUp, 
  Layers, 
  Camera, 
  FileSpreadsheet, 
  HelpCircle,
  Clock
} from 'lucide-react'
import './VariableOperationalization.css'
import { getBackendUrl } from '../utils/config.js'

const BACKEND_URL = getBackendUrl()

function VariableOperationalization() {
  const [indicadores, setIndicadores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDimension, setSelectedDimension] = useState('all')

  const fetchMetrics = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/analytics/operationalization`)
      setIndicadores(response.data.indicadores || [])
    } catch (err) {
      console.error('Error fetching operationalization metrics:', err)
      setError('No se pudieron recuperar las métricas de operacionalización. Verifique la conexión con el servidor SQL.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  // Extraer las dimensiones únicas para el filtro
  const dimensions = ['all', ...new Set(indicadores.map(ind => ind.dimension))]

  // Filtrar indicadores
  const filteredIndicadores = selectedDimension === 'all' 
    ? indicadores 
    : indicadores.filter(ind => ind.dimension === selectedDimension)

  const getDimensionIcon = (dimensionName) => {
    switch (dimensionName) {
      case 'Visión Artificial e Inferencia de Tránsito':
        return <Cpu className="dim-icon glow-indigo" size={18} />
      case 'Desempeño y Rendimiento Técnico':
        return <TrendingUp className="dim-icon glow-violet" size={18} />
      case 'Equipamiento y Cobertura de Infraestructura Vial':
        return <Camera className="dim-icon glow-cyan" size={18} />
      case 'Gestión de Control y Auditoría Operativa':
        return <ShieldCheck className="dim-icon glow-green" size={18} />
      default:
        return <Layers className="dim-icon" size={18} />
    }
  }

  const formatValue = (id, val) => {
    if (id === 'ind_velocidad_inferencia') {
      return `${val}s`
    }
    if (id === 'ind_auditoria_sistema') {
      return `${Math.round(val)} logs`
    }
    return `${val}%`
  }

  const renderLoading = () => (
    <div className="glass-panel loader-box animate-fade-in">
      <RefreshCw className="spinner-icon-history" size={40} />
      <h3>Compilando Matriz de Operacionalización</h3>
      <p>Calculando proporciones matemáticas y consolidando registros relacionales de la base de datos SQL...</p>
    </div>
  );

  const renderError = () => (
    <div className="glass-panel error-box animate-fade-in">
      <ShieldCheck size={64} className="error-icon" />
      <h3>Error de Conexión</h3>
      <p>{error}</p>
      <button className="btn-primary" onClick={fetchMetrics}>Reintentar</button>
    </div>
  );

  const renderContent = () => (
    <div className="matrix-layout animate-fade-in">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrap bg-indigo-glow">
            <Cpu size={22} />
          </div>
          <div className="kpi-text">
            <span className="kpi-lbl">Confianza Promedio IA</span>
            <span className="kpi-val">
              {formatValue('ind_confianza_infracciones', indicadores.find(i => i.id === 'ind_confianza_infracciones')?.valor || 0)}
            </span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrap bg-violet-glow">
            <Clock size={22} />
          </div>
          <div className="kpi-text">
            <span className="kpi-lbl">Velocidad Promedio Inferencia</span>
            <span className="kpi-val">
              {formatValue('ind_velocidad_inferencia', indicadores.find(i => i.id === 'ind_velocidad_inferencia')?.valor || 0)}
            </span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrap bg-cyan-glow">
            <Camera size={22} />
          </div>
          <div className="kpi-text">
            <span className="kpi-lbl">Operatividad de Cámaras</span>
            <span className="kpi-val">
              {formatValue('ind_operatividad_camaras', indicadores.find(i => i.id === 'ind_operatividad_camaras')?.valor || 0)}
            </span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrap bg-green-glow">
            <Database size={22} />
          </div>
          <div className="kpi-text">
            <span className="kpi-lbl">Volumen de Auditoría</span>
            <span className="kpi-val">
              {formatValue('ind_auditoria_sistema', indicadores.find(i => i.id === 'ind_auditoria_sistema')?.valor || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="glass-panel table-panel">
        <div className="table-header-box">
          <h3 className="panel-title-op"><FileSpreadsheet size={16} /> Matriz de Operacionalización (Medición en Tiempo Real)</h3>
          <span className="count-badge">{filteredIndicadores.length} Indicadores visualizados</span>
        </div>
        <div className="table-wrapper">
          <table className="history-table op-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Dimensión</th>
                <th style={{ width: '20%' }}>Indicador</th>
                <th style={{ width: '20%' }}>Fórmula Metodológica</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Valor Real</th>
                <th style={{ width: '16%' }}>Estado / Evidencia</th>
                <th style={{ width: '10%' }}>Instrumento</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicadores.map((ind) => {
                let progressColor = '#10b981';
                if (ind.valor < 30) {
                  progressColor = '#ef4444';
                } else if (ind.valor < 70) {
                  progressColor = '#f59e0b';
                }

                // For processing time and logs, we don't scale it out of 100 on the bar
                const isPercentage = ind.id !== 'ind_velocidad_inferencia' && ind.id !== 'ind_auditoria_sistema'
                const percentVal = isPercentage ? Math.min(ind.valor, 100) : 100

                return (
                  <tr key={ind.id}>
                    <td className="dim-cell">
                      <div className="dim-cell-content">
                        {getDimensionIcon(ind.dimension)}
                        <span>{ind.dimension}</span>
                      </div>
                    </td>
                    <td className="font-semibold">{ind.nombre}</td>
                    <td className="code-font formula-text">{ind.formula}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="val-badge-container">
                        <span className="val-text-primary" style={{ color: progressColor }}>
                          {formatValue(ind.id, ind.valor)}
                        </span>
                        {isPercentage && (
                          <div className="op-progress-bar-bg">
                            <div 
                              className="op-progress-bar-fill" 
                              style={{ 
                                width: `${percentVal}%`, 
                                backgroundColor: progressColor,
                                boxShadow: `0 0 6px ${progressColor}`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="detail-text">{ind.detalle}</td>
                    <td>
                      <span className="instrument-badge">{ind.instrumento}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Details Section */}
      <div className="glass-panel methodology-guide">
        <h3 className="section-title-op"><HelpCircle size={16} /> Guía Metodológica de Evidencia</h3>
        <p>Este sistema proporciona una **Ficha de Observación Digitalizada** para cada indicador. Los valores se recalculan en caliente directamente en la base de datos SQL relacional mediante consultas agregadas, garantizando los principios de **Validez** y **Confiabilidad** de la medición científica:</p>
        <div className="methodology-grid">
          <div className="methodology-item">
            <strong>Validez de Contenido:</strong>
            <span>Cada fórmula corresponde exactamente a los conceptos teóricos de la ingeniería de software y control de tránsito municipal.</span>
          </div>
          <div className="methodology-item">
            <strong>Confiabilidad del Instrumento:</strong>
            <span>Las consultas se ejecutan de manera consistente y automatizada en base a las transacciones viales reales guardadas en las tablas relacionales.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    return renderContent();
  };

  return (
    <div className="op-page-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">📊</span>
          <h1 className="brand-title">Operacionalización<span>Variable Independiente</span></h1>
        </div>
        <p className="brand-subtitle">Matriz técnica de variables, dimensiones, indicadores e instrumentos de medición del sistema</p>
      </header>

      {/* Info Warning Card */}
      <div className="glass-panel info-banner animate-fade-in">
        <div className="banner-icon-box">💡</div>
        <div className="banner-text">
          <strong>Variable Independiente:</strong> <em>"Sistema de gestión y control de infracciones de tránsito basado en Inteligencia Artificial y Visión Artificial"</em>.
          <p>Este módulo presenta el estado cuantitativo real de los indicadores definidos en la matriz de la investigación, permitiendo realizar la auditoría metodológica del sistema y obtener evidencias objetivas de su funcionamiento.</p>
        </div>
      </div>

      {/* Dimension Filter Bar */}
      <div className="filter-bar-operationalization animate-fade-in">
        <div className="filter-label">Filtrar por Dimensión:</div>
        <div className="filter-buttons">
          {dimensions.map((dim) => (
            <button
              key={dim}
              className={`filter-btn ${selectedDimension === dim ? 'active-filter' : ''}`}
              onClick={() => setSelectedDimension(dim)}
            >
              {dim === 'all' ? 'Todas las Dimensiones' : dim}
            </button>
          ))}
        </div>
        <button className="btn-refresh-op btn-audit-refresh" onClick={fetchMetrics} title="Actualizar datos">
          <RefreshCw size={12} className={isLoading ? "spin-badge-icon" : ""} /> Refrescar
        </button>
      </div>

      {/* Main Content Area */}
      <main className="op-main-content">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default VariableOperationalization
