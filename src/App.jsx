import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard' // <--- IMPORTAMOS EL DASHBOARD
import Cotizador from './components/Cotizador'
import Vehiculos from './components/Vehiculos'
import Historial from './components/Historial'
import Clientes from './components/Clientes'
import Servicios from './components/Servicios'

function App() {
  // <--- AHORA EL ESTADO INICIAL ES 'dashboard' --->
  const [seccionActiva, setSeccionActiva] = useState('dashboard')

  return (
    <div className="dashboard-layout">
      
      <aside className="sidebar">
        <div className="logo">🦆 Taller El Pato</div>
        <nav>
          
          {/* NUEVO BOTÓN DE INICIO */}
          <div 
            className={`menu-item ${seccionActiva === 'dashboard' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('dashboard')}
          >
            📊 Inicio
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'cotizador' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('cotizador')}
          >
            📝 Cotizador
          </div>
          
          <div 
            className={`menu-item ${seccionActiva === 'vehiculos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('vehiculos')}
          >
            🚗 Vehículos
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'historial' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('historial')}
          >
            📜 Historial
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'clientes' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('clientes')}
          >
            👥 Clientes
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'servicios' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('servicios')}
          >
            🔧 Servicios
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <div style={{ background: 'white', padding: '8px 15px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontWeight: 'bold', color: '#334155'}}>
              👤 Nestor
            </div>
        </div>

        {/* MOSTRAMOS EL DASHBOARD CUANDO ESTÁ ACTIVO */}
        {seccionActiva === 'dashboard' && <Dashboard />}
        {seccionActiva === 'cotizador' && <Cotizador />}
        {seccionActiva === 'vehiculos' && <Vehiculos />}
        {seccionActiva === 'historial' && <Historial />}
        {seccionActiva === 'clientes' && <Clientes />}
        {seccionActiva === 'servicios' && <Servicios />}
        
      </main>
    </div>
  )
}

export default App