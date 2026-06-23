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
import VariableOperationalization from './pages/VariableOperationalization.jsx'
import { UploadCloud, BarChart3, LogOut, BarChart4, ClipboardList, Settings, Camera, Users, ShieldAlert, FileSpreadsheet } from 'lucide-react'

const TABS = [
  { id: 'upload', label: 'Analizar Video', Icon: UploadCloud, Component: UploadVideo },
  { id: 'report', label: 'Monitoreo y Reportes', Icon: BarChart3, Component: Report },
  { id: 'analytics', label: 'Panel Analítico', Icon: BarChart4, Component: DashboardStats },
  { id: 'history', label: 'Historial de Infracciones', Icon: ClipboardList, Component: InfractionHistory },
  { id: 'settings', label: 'Configuración Vial', Icon: Settings, Component: SettingsPanel },
  { id: 'cameras', label: 'Red de Cámaras', Icon: Camera, Component: CamerasRegistry },
  { id: 'citizens', label: 'Consulta Ciudadana', Icon: Users, Component: CitizenSearch },
  { id: 'audit', label: 'Control y Auditoría', Icon: ShieldAlert, Component: AuditControl },
  { id: 'operationalization', label: 'Matriz de Variables', Icon: FileSpreadsheet, Component: VariableOperationalization }
]

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
            {TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button 
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    width: '100%',
                    background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
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
                    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? '#a5b4fc' : '#64748b' }} /> {label}
                </button>
              );
            })}
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
        {(() => {
          const activeTabObj = TABS.find(tab => tab.id === activeTab);
          if (activeTabObj) {
            const ActiveComponent = activeTabObj.Component;
            return <ActiveComponent />;
          }
          return null;
        })()}
      </div>
      
    </div>
  )
}

export default App

