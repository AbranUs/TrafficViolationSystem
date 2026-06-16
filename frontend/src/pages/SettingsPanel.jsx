import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  DollarSign, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Check, 
  RotateCcw,
  Sparkles,
  Play
} from 'lucide-react'
import './SettingsPanel.css'

function SettingsPanel() {
  // Fine Rates State
  const [fineRed, setFineRed] = useState(250.00)
  const [fineUturn, setFineUturn] = useState(150.00)
  const [fineCrosswalk, setFineCrosswalk] = useState(180.00)

  // IA Settings
  const [minConfidence, setMinConfidence] = useState(50)
  const [audioAlerts, setAudioAlerts] = useState(true)

  // UI States
  const [isSaved, setIsSaved] = useState(false)

  // Load from local storage
  useEffect(() => {
    const savedRed = localStorage.getItem('settings_fine_red')
    const savedUturn = localStorage.getItem('settings_fine_uturn')
    const savedCrosswalk = localStorage.getItem('settings_fine_crosswalk')
    const savedMinConf = localStorage.getItem('settings_min_confidence')
    const savedAudio = localStorage.getItem('settings_audio_alerts')

    if (savedRed) setFineRed(parseFloat(savedRed))
    if (savedUturn) setFineUturn(parseFloat(savedUturn))
    if (savedCrosswalk) setFineCrosswalk(parseFloat(savedCrosswalk))
    if (savedMinConf) setMinConfidence(parseInt(savedMinConf))
    if (savedAudio !== null) setAudioAlerts(savedAudio === 'true')
  }, [])

  // Test the audio warning using Web Audio API
  const handleTestAudio = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      
      // 1. Create Oscillator for a clear alert beep
      const osc1 = audioCtx.createOscillator()
      const osc2 = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime) // High Pitch (A5)
      
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(440, audioCtx.currentTime) // Under-tone (A4)

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)

      osc1.connect(gainNode)
      osc2.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      osc1.start()
      osc2.start()

      osc1.stop(audioCtx.currentTime + 0.5)
      osc2.stop(audioCtx.currentTime + 0.5)
    } catch (e) {
      console.warn('Web Audio API not supported or blocked by user gesture:', e)
    }
  }

  // Save changes
  const handleSave = () => {
    localStorage.setItem('settings_fine_red', fineRed.toString())
    localStorage.setItem('settings_fine_uturn', fineUturn.toString())
    localStorage.setItem('settings_fine_crosswalk', fineCrosswalk.toString())
    localStorage.setItem('settings_min_confidence', minConfidence.toString())
    localStorage.setItem('settings_audio_alerts', audioAlerts.toString())

    setIsSaved(true)
    
    // Play alert sound if enabled
    if (audioAlerts) {
      handleTestAudio()
    }

    setTimeout(() => {
      setIsSaved(false)
    }, 2500)
  }

  // Restore factory settings
  const handleReset = () => {
    if (window.confirm('¿Desea restaurar los valores de configuración predeterminados de fábrica?')) {
      setFineRed(250.00)
      setFineUturn(150.00)
      setFineCrosswalk(180.00)
      setMinConfidence(50)
      setAudioAlerts(true)

      localStorage.removeItem('settings_fine_red')
      localStorage.removeItem('settings_fine_uturn')
      localStorage.removeItem('settings_fine_crosswalk')
      localStorage.removeItem('settings_min_confidence')
      localStorage.removeItem('settings_audio_alerts')

      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
      }, 2000)
    }
  }

  return (
    <div className="settings-page-container">
      {/* Header */}
      <header className="page-header">
        <div className="logo-box">
          <span className="logo-icon">⚙️</span>
          <h1 className="brand-title">Configuración<span>Vial</span></h1>
        </div>
        <p className="brand-subtitle">Establezca los montos de multas y configure parámetros y alertas operativas de IA</p>
      </header>

      <div className="settings-grid-layout">
        
        {/* COLUMNA IZQUIERDA: VALORES DE MULTAS ECONÓMICAS */}
        <div className="glass-panel settings-card animate-fade-in">
          <h3 className="card-section-title">
            <DollarSign size={18} className="icon-gold" /> Tarifas de Multas y Penalizaciones
          </h3>
          <p className="section-description">
            Determine la sanción económica para cada una de las infracciones viales detectadas automáticamente por el sistema.
          </p>

          <div className="settings-inputs-list">
            <div className="input-group-settings">
              <div className="label-meta">
                <span className="input-title">Semáforo en Rojo</span>
                <span className="input-sub">Cruce de línea de detención en luz roja</span>
              </div>
              <div className="input-currency-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="number" 
                  value={fineRed}
                  onChange={(e) => setFineRed(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="settings-num-input"
                  min="0"
                  step="10"
                />
                <span className="currency-suffix">USD</span>
              </div>
            </div>

            <div className="input-group-settings">
              <div className="label-meta">
                <span className="input-title">Giro Prohibido en U</span>
                <span className="input-sub">Cambio irregular de dirección en zona no permitida</span>
              </div>
              <div className="input-currency-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="number" 
                  value={fineUturn}
                  onChange={(e) => setFineUturn(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="settings-num-input"
                  min="0"
                  step="10"
                />
                <span className="currency-suffix">USD</span>
              </div>
            </div>

            <div className="input-group-settings">
              <div className="label-meta">
                <span className="input-title">Invasión de Paso Peatonal</span>
                <span className="input-sub">Estacionamiento o detención sobre senda peatonal</span>
              </div>
              <div className="input-currency-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="number" 
                  value={fineCrosswalk}
                  onChange={(e) => setFineCrosswalk(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="settings-num-input"
                  min="0"
                  step="10"
                />
                <span className="currency-suffix">USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ALERTAS DE AUDIO & PARÁMETROS IA */}
        <div className="glass-panel settings-card animate-fade-in">
          <h3 className="card-section-title">
            <Sliders size={18} className="icon-indigo" /> Filtros Operativos y Alertas
          </h3>
          <p className="section-description">
            Ajuste el comportamiento visual y acústico del panel cuando el motor de IA concluya un análisis de metraje.
          </p>

          <div className="settings-inputs-list">
            {/* Slider de confianza */}
            <div className="input-group-settings">
              <div className="label-meta">
                <span className="input-title">Filtro de Certeza de IA</span>
                <span className="input-sub">Umbral mínimo de confianza para registrar una infracción</span>
              </div>
              <div className="slider-control-row">
                <input 
                  type="range" 
                  min="30" 
                  max="95" 
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  className="settings-slider"
                />
                <span className="slider-value-badge">{minConfidence}%</span>
              </div>
            </div>

            {/* Toggle de Alertas Acústicas */}
            <div className="input-group-settings flex-row-settings">
              <div className="label-meta">
                <span className="input-title">Alertas Sonoras</span>
                <span className="input-sub">Reproducir señal auditiva al detectar infracciones</span>
              </div>
              <label className="switch-ios">
                <input 
                  type="checkbox" 
                  checked={audioAlerts}
                  onChange={(e) => setAudioAlerts(e.target.checked)}
                />
                <span className="slider-switch"></span>
              </label>
            </div>

            {/* Test de Audio */}
            {audioAlerts && (
              <div className="audio-test-row">
                <span className="audio-test-text">Prueba de oscilador acústico (Web Audio API):</span>
                <button 
                  type="button" 
                  className="btn-action-view btn-audio-test"
                  onClick={handleTestAudio}
                >
                  <Play size={12} fill="currentColor" /> Emitir Sonido Demo
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ACCIONES DE GUARDADO / RESTAURACIÓN */}
      <footer className="settings-footer-actions animate-fade-in">
        <button 
          className="btn-settings-secondary"
          onClick={handleReset}
          title="Revertir cambios"
        >
          <RotateCcw size={14} /> Restaurar de Fábrica
        </button>

        <button 
          className="btn-primary btn-settings-save"
          onClick={handleSave}
        >
          {isSaved ? (
            <>
              <Check size={14} /> ¡Configuración Guardada!
            </>
          ) : (
            <>
              <Sparkles size={14} /> Aplicar Configuración
            </>
          )}
        </button>
      </footer>
    </div>
  )
}

export default SettingsPanel
