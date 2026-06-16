import React, { useState, useEffect } from 'react'
import UploadVideo from './pages/UploadVideo.jsx'
import Report from './pages/Report.jsx'
import Login from './pages/Login.jsx'
import DashboardStats from './pages/DashboardStats.jsx'
import InfractionHistory from './pages/InfractionHistory.jsx'
import SettingsPanel from './pages/SettingsPanel.jsx'
import CamerasRegistry from './pages/CamerasRegistry.jsx'
import CitizenSearch from './pages/CitizenSearch.jsx'
import AuditControl from './pages/AuditControl.jsx'
import { UploadCloud, BarChart3, LogOut, BarChart4, ClipboardList, Settings, Camera, Users, ShieldAlert } from 'lucide-react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState('upload') // 'upload', 'report', 'analytics', 'history' o 'settings'

  // Validar sesión del usuario al montar el componente principal
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_username')
    if (token && savedUser) {
      setIsLoggedIn(true)
      setUsername(savedUser)
    }
  }, [])

  const handleLoginSuccess = (loggedUser) => {
    setIsLoggedIn(true)
    setUsername(loggedUser)
    setActiveTab('upload') // Por defecto ir al cargador tras el login
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
    setIsLoggedIn(false)
    setUsername('')
    setActiveTab('upload')
  }

  // SI NO ESTÁ LOGUEADO, MOSTRAR PANTALLA DE INICIO DE SESIÓN
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      backgroundColor: '#080c14',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden'
    }}>
      
      {/* SIDEBAR DE NAVEGACIÓN IZQUIERDO PREMIUM */}
      <nav style={{
        width: '280px',
        minWidth: '280px',
        height: '100vh',
        background: 'rgba(11, 17, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        boxSizing: 'border-box',
        zIndex: 500,
        justifyContent: 'space-between'
      }}>
        {/* Top Header: Logo */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '1.8rem' }}>🚦</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontFamily: "'Outfit', sans-serif", 
                fontWeight: 800, 
                fontSize: '1.25rem', 
                letterSpacing: '-0.02em', 
                color: '#f8fafc',
                lineHeight: 1.1
              }}>
                IA <span style={{ color: '#8b5cf6' }}>CONTROL</span>
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                color: '#64748b', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: '2px'
              }}>
                Municipalidad Vial
              </span>
            </div>
          </div>

          {/* Links de Control de Pestañas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button 
              onClick={() => setActiveTab('upload')}
              style={{
                width: '100%',
                background: activeTab === 'upload' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'upload' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'upload' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'upload' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <UploadCloud size={16} style={{ color: activeTab === 'upload' ? '#a5b4fc' : '#64748b' }} /> Analizar Video
            </button>
            
            <button 
              onClick={() => setActiveTab('report')}
              style={{
                width: '100%',
                background: activeTab === 'report' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'report' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'report' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'report' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <BarChart3 size={16} style={{ color: activeTab === 'report' ? '#a5b4fc' : '#64748b' }} /> Monitoreo y Reportes
            </button>

            <button 
              onClick={() => setActiveTab('analytics')}
              style={{
                width: '100%',
                background: activeTab === 'analytics' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'analytics' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'analytics' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'analytics' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <BarChart4 size={16} style={{ color: activeTab === 'analytics' ? '#a5b4fc' : '#64748b' }} /> Panel Analítico
            </button>

            <button 
              onClick={() => setActiveTab('history')}
              style={{
                width: '100%',
                background: activeTab === 'history' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'history' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'history' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'history' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <ClipboardList size={16} style={{ color: activeTab === 'history' ? '#a5b4fc' : '#64748b' }} /> Historial de Infracciones
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                width: '100%',
                background: activeTab === 'settings' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'settings' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'settings' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'settings' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <Settings size={16} style={{ color: activeTab === 'settings' ? '#a5b4fc' : '#64748b' }} /> Configuración Vial
            </button>

            <button 
              onClick={() => setActiveTab('cameras')}
              style={{
                width: '100%',
                background: activeTab === 'cameras' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'cameras' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'cameras' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'cameras' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <Camera size={16} style={{ color: activeTab === 'cameras' ? '#a5b4fc' : '#64748b' }} /> Red de Cámaras
            </button>

            <button 
              onClick={() => setActiveTab('citizens')}
              style={{
                width: '100%',
                background: activeTab === 'citizens' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'citizens' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'citizens' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'citizens' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <Users size={16} style={{ color: activeTab === 'citizens' ? '#a5b4fc' : '#64748b' }} /> Consulta Ciudadana
            </button>

            <button 
              onClick={() => setActiveTab('audit')}
              style={{
                width: '100%',
                background: activeTab === 'audit' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'audit' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: activeTab === 'audit' ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: activeTab === 'audit' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <ShieldAlert size={16} style={{ color: activeTab === 'audit' ? '#a5b4fc' : '#64748b' }} /> Control y Auditoría
            </button>
          </div>
        </div>

        {/* Bottom Panel: Admin details & Logout button */}
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Funcionario Activo</span>
            <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>{username}</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={14} /> Salir del Sistema
          </button>
        </div>
      </nav>

      {/* RENDERIZADO REACTIVO DEL COMPONENTE */}
      <div style={{ 
        flexGrow: 1, 
        height: '100vh',
        overflowY: 'auto',
        padding: '2.5rem 3rem',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'upload' && <UploadVideo />}
        {activeTab === 'report' && <Report />}
        {activeTab === 'analytics' && <DashboardStats />}
        {activeTab === 'history' && <InfractionHistory />}
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'cameras' && <CamerasRegistry />}
        {activeTab === 'citizens' && <CitizenSearch />}
        {activeTab === 'audit' && <AuditControl />}
      </div>
      
    </div>
  )
}

export default App

