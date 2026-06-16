import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BarChart3, 
  TrendingUp, 
  Video, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  ShieldAlert,
  Percent
} from 'lucide-react'
import './DashboardStats.css'
import { getBackendUrl } from '../utils/config.js'

const BACKEND_URL = getBackendUrl()

function DashboardStats() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/analytics/stats`)
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching analytics stats:', err)
      setError('No se pudieron cargar las estadísticas. Verifique la conexión con el servidor SQL.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatSeconds = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
  }

  // Cálculos para Gráfico de Tendencia SVG (Línea de tendencias)
  const renderTrendChart = () => {
    if (!stats || !Array.isArray(stats.tendencia_historial) || stats.tendencia_historial.length === 0) return null

    const data = stats.tendencia_historial
    const width = 500
    const height = 180
    const padding = 30

    // Encontrar máximos y mínimos
    const counts = data.map(d => d.count)
    const maxCount = Math.max(...counts, 5) // Mínimo 5 para escalado visual decente
    const minCount = 0

    // Generar coordenadas X e Y
    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding)
      const y = height - padding - ((d.count - minCount) / (maxCount - minCount)) * (height - 2 * padding)
      return { x, y, ...d }
    })

    // Construir línea SVG (Path)
    const pathD = points.reduce((acc, point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`
    }, '')

    // Construir línea inferior para el sombreado de área (Area path)
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : ''

    return (
      <svg className="svg-trend-chart" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="trendGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <filter id="neonGlowLine" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.6"/>
          </filter>
        </defs>

        {/* Ejes y Cuadrícula de referencia */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        
        {/* Línea horizontal del valor medio de referencia */}
        <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />

        {/* Área Sombreada de Degradado */}
        {areaD && <path d={areaD} fill="url(#trendGlow)" />}

        {/* Línea Principal del Gráfico (Curva) */}
        {pathD && <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" filter="url(#neonGlowLine)" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Puntos y Etiquetas */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
            <text x={pt.x} y={pt.y - 12} fontSize="9" fontWeight="600" fill="#f8fafc" textAnchor="middle">
              {pt.count}
            </text>
            <text x={pt.x} y={height - 10} fontSize="8" fontWeight="500" fill="#94a3b8" textAnchor="middle">
              {pt.fecha.substring(5)} {/* Recortar YYYY- de la fecha para simplificar */}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  // Gráfico de Barras SVG (Distribución de Infracciones)
  const renderBarChart = () => {
    if (!stats || !Array.isArray(stats.infraction_distribution) || stats.infraction_distribution.length === 0) {
      return (
        <div className="empty-chart-fallback">
          <CheckCircle size={32} className="green-decor" />
          <p>No hay infracciones registradas para calcular distribución.</p>
        </div>
      )
    }

    const data = stats.infraction_distribution
    const maxVal = Math.max(...data.map(d => d.count), 1)

    return (
      <div className="bar-chart-container-flex">
        {data.map((item, index) => {
          const percent = (item.count / maxVal) * 100
          
          let barColor = "var(--accent-indigo)"
          if (item.tipo === "Cruce de semáforo en rojo") barColor = "var(--accent-red)"
          if (item.tipo === "Giro prohibido") barColor = "var(--accent-violet)"
          if (item.tipo === "Invasión de paso peatonal") barColor = "var(--accent-orange)"

          return (
            <div key={index} className="bar-row">
              <span className="bar-label-text">{item.tipo}</span>
              <div className="bar-track-wrap">
                <div 
                  className="bar-fill-neon animate-width"
                  style={{ 
                    width: `${percent}%`, 
                    backgroundColor: barColor,
                    boxShadow: `0 0 10px ${barColor}`
                  }}
                />
              </div>
              <span className="bar-counter-text">{item.count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="dashboard-stats-page">
      {/* Encabezado del Dashboard */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">📈</span>
          <h1 className="brand-title">Estadísticas<span>Viales</span></h1>
        </div>
        <p className="brand-subtitle">Visualización agregada y análisis de infracciones recolectadas</p>
      </header>

      {/* 1. ESTADO DE LOADING / ERROR */}
      {isLoading && (
        <div className="glass-panel stats-loader-card animate-fade-in">
          <RefreshCw className="spinner-icon-stats" size={40} />
          <h3>Compilando Métricas Consolidadas</h3>
          <p>Consultando registros en base de datos SQL y renderizando reportes vectoriales...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel stats-error-card animate-fade-in">
          <ShieldAlert size={64} className="error-icon-stats" />
          <h3>Error al Cargar Analíticas</h3>
          <p className="error-msg-stats">{error}</p>
          <button className="btn-primary" onClick={fetchStats}>
            Reintentar Conexión
          </button>
        </div>
      )}

      {/* 2. TABLERO DE ESTADÍSTICAS EXITOSO */}
      {!isLoading && !error && stats && (
        <div className="stats-dashboard-grid animate-fade-in">
          
          {/* PRIMER BLOQUE: TARJETAS DE MÉTRICAS */}
          <div className="stats-metrics-row">
            <div className="glass-panel metric-card-stats">
              <div className="metric-icon-wrap bg-blue">
                <Video size={20} />
              </div>
              <div className="metric-text-wrap">
                <span className="metric-lbl">Videos Cargados</span>
                <span className="metric-val">{stats.total_videos}</span>
              </div>
            </div>

            <div className="glass-panel metric-card-stats">
              <div className="metric-icon-wrap bg-red">
                <AlertTriangle size={20} />
              </div>
              <div className="metric-text-wrap">
                <span className="metric-lbl">Multas Detectadas</span>
                <span className="metric-val color-alert">{stats.total_infractions}</span>
              </div>
            </div>

            <div className="glass-panel metric-card-stats">
              <div className="metric-icon-wrap bg-green">
                <Percent size={20} />
              </div>
              <div className="metric-text-wrap">
                <span className="metric-lbl">Promedio Confianza IA</span>
                <span className="metric-val">{Math.round(stats.promedio_confianza * 100)}%</span>
              </div>
            </div>
          </div>

          {/* SEGUNDO BLOQUE: GRÁFICOS */}
          <div className="stats-charts-row">
            {/* Gráfico de Tendencias en Línea */}
            <div className="glass-panel chart-panel-card">
              <h3 className="chart-title"><TrendingUp size={16} className="glow-indigo" /> Historial de Multas Recientes</h3>
              <p className="chart-desc">Evolución cuantitativa de infracciones detectadas agrupadas cronológicamente por día.</p>
              <div className="svg-chart-wrapper">
                {renderTrendChart()}
              </div>
            </div>

            {/* Gráfico de Distribución en Barras */}
            <div className="glass-panel chart-panel-card">
              <h3 className="chart-title"><BarChart3 size={16} className="glow-violet" /> Distribución por Tipología</h3>
              <p className="chart-desc">Inspección de las reglas de tránsito más violadas en los videos procesados.</p>
              <div className="bars-chart-wrapper">
                {renderBarChart()}
              </div>
            </div>
          </div>

          {/* TERCER BLOQUE: HISTORIAL DE INFRACCIONES RECIENTES */}
          <div className="stats-lower-log-row">
            <div className="glass-panel log-panel-card">
              <div className="log-panel-header">
                <h3><Clock size={16} /> Registro de Últimas Infracciones</h3>
                <button className="btn-refresh-stats" onClick={fetchStats} title="Actualizar datos">
                  <RefreshCw size={12} /> Actualizar
                </button>
              </div>
              
              {(!stats.recent_infractions || stats.recent_infractions.length === 0) ? (
                <div className="empty-log-fallback">
                  <CheckCircle size={32} className="green-decor" />
                  <p>No se registran infracciones en la base de datos.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Infracción ID</th>
                        <th>Tipo</th>
                        <th>Segundo</th>
                        <th>Placa OCR</th>
                        <th>Confianza IA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(stats.recent_infractions) && stats.recent_infractions.map((inf) => {
                        let rowClass = "row-badge-gray"
                        if (inf.tipo === "Cruce de semáforo en rojo") rowClass = "row-badge-red"
                        if (inf.tipo === "Giro prohibido") rowClass = "row-badge-violet"
                        if (inf.tipo === "Invasión de paso peatonal") rowClass = "row-badge-orange"

                        return (
                          <tr key={inf.id}>
                            <td className="code-font font-xsmall">{inf.id}</td>
                            <td>
                              <span className={`violation-row-badge ${rowClass}`}>{inf.tipo}</span>
                            </td>
                            <td className="code-font">{formatSeconds(inf.timestamp)}</td>
                            <td>
                              <span className="plate-badge-row">{inf.placa_vehiculo || 'No detectada'}</span>
                            </td>
                            <td className="code-font font-bold">{Math.round(inf.confianza * 100)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default DashboardStats
