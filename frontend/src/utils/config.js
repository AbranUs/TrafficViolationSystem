/**
 * Resuelve la URL base del Backend de forma dinámica y autocurativa.
 */
export const getBackendUrl = () => {
  // 1. Usar la variable de entorno de Vite si está disponible
  let url = import.meta.env.VITE_API_URL;
  
  if (url && url.trim() !== '' && url !== 'undefined') {
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url;
  }
  
  // 2. Si no, autodetectar si corre en Render
  const origin = window.location.origin;
  if (origin.includes('traffic-violations-frontend.onrender.com')) {
    return 'https://traffic-violations-backend.onrender.com';
  }
  if (origin.includes('-frontend')) {
    return origin.replace('-frontend', '-backend');
  }
  
  // 3. Desarrollo local
  return 'http://localhost:8000';
};
