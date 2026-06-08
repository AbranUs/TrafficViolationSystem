import React, { useState, useEffect } from 'react'
import UploadVideo from './pages/UploadVideo.jsx'
import Report from './pages/Report.jsx'
import Login from './pages/Login.jsx'
import DashboardStats from './pages/DashboardStats.jsx'
import { UploadCloud, BarChart3, LogOut, BarChart4 } from 'lucide-react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState('upload') // 'upload', 'report' o 'analytics'

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
      minHeight: '100vh', 
      margin: 0, 
      padding: 0, 
      backgroundColor: '#080c14',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR GLASSMORPHIC */}
      <nav style={{
        background: 'rgba(15, 22, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 500,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        boxSizing: 'border-box'
      }}>
        {/* Isotipo Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚦</span>
          <span style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontWeight: 800, 
            fontSize: '1.15rem', 
            letterSpacing: '-0.02em', 
            color: '#f8fafc' 
          }}>
            IA <span style={{ color: '#8b5cf6' }}>CONTROL</span>
          </span>
        </div>

        {/* Links de Control de Pestañas */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveTab('upload')}
            style={{
              background: activeTab === 'upload' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              border: activeTab === 'upload' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              color: activeTab === 'upload' ? '#a5b4fc' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.3s ease'
            }}
          >
            <UploadCloud size={14} /> Analizar Video
          </button>
          
          <button 
            onClick={() => setActiveTab('report')}
            style={{
              background: activeTab === 'report' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              border: activeTab === 'report' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              color: activeTab === 'report' ? '#a5b4fc' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.3s ease'
            }}
          >
            <BarChart3 size={14} /> Monitoreo y Reportes
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            style={{
              background: activeTab === 'analytics' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              border: activeTab === 'analytics' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              color: activeTab === 'analytics' ? '#a5b4fc' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.3s ease'
            }}
          >
            <BarChart4 size={14} /> Panel Analítico
          </button>
        </div>

        {/* Cierre de Sesión */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            Adm: <strong style={{ color: '#cbd5e1' }}>{username}</strong>
          </span>
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={12} /> Salir
          </button>
        </div>
      </nav>

      {/* RENDERIZADO REACTIVO DEL COMPONENTE */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingTop: '2rem' }}>
        {activeTab === 'upload' && <UploadVideo />}
        {activeTab === 'report' && <Report />}
        {activeTab === 'analytics' && <DashboardStats />}
      </div>
      
    </div>
  )
}

export default App

