import React, { useState } from 'react'
import axios from 'axios'
import { Lock, User as UserIcon, LogIn, AlertOctagon } from 'lucide-react'
import './Login.css'
import { getBackendUrl } from '../utils/config.js'

const BACKEND_URL = getBackendUrl()

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Por favor complete todos los campos.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
        username,
        password
      })

      const { access_token, username: loggedUser } = response.data
      
      // Guardar el token en localStorage para persistir la sesión
      localStorage.setItem('auth_token', access_token)
      localStorage.setItem('auth_username', loggedUser)

      // Notificar al componente contenedor principal
      onLoginSuccess(loggedUser)

    } catch (err) {
      console.error('Error en Login:', err)
      setError(
        err.response?.data?.detail || 
        'Error al conectar con el servidor. Asegúrese de que el backend esté corriendo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      {/* Fondo con círculos decorativos difuminados */}
      <div className="glow-circle gc-1"></div>
      <div className="glow-circle gc-2"></div>

      <div className="login-card glass-panel animate-scale-up">
        <header className="login-header">
          <span className="login-logo">🚦</span>
          <h2 className="login-title">Control<span>Vial</span></h2>
          <p className="login-subtitle">Sistema de Control de Infracciones de Tránsito</p>
        </header>

        {error && (
          <div className="login-error-box animate-fade-in">
            <AlertOctagon size={16} className="error-box-icon" />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Usuario</label>
            <div className="input-wrapper">
              <UserIcon size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Nombre de usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="Ingrese su contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary btn-login animate-pulse-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loader-span">Autenticando...</span>
            ) : (
              <>
                <LogIn size={16} /> Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        <footer className="login-card-footer">
          <p className="seed-tip">Usuario semilla de pruebas: <code>admin</code> / <code>admin123</code></p>
        </footer>
      </div>
    </div>
  )
}

export default Login
