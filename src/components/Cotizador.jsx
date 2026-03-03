import { useEffect, useState } from 'react'

function Cotizador() {
  const [servicios, setServicios] = useState([])
  const [vehiculoId, setVehiculoId] = useState('')
  const [carrito, setCarrito] = useState([])
  const [presupuesto, setPresupuesto] = useState(null)
  
  // NUEVO: Estado para saber qué pestañas (grupos) están abiertas
  const [gruposExpandidos, setGruposExpandidos] = useState({})

  useEffect(() => {
    fetch('http://localhost:8080/api/servicios')
      .then(res => res.json())
      .then(data => setServicios(data))
      .catch(err => console.error(err))
  }, [])

  const agregarAlCarrito = (servicio) => {
    const item = { 
      tipoServicio: { id: servicio.id }, 
      cantidad: 1, 
      nombre: servicio.descripcion, 
      precioEstimado: servicio.precioA 
    }
    setCarrito([...carrito, item])
  }

  const quitarDelCarrito = (indexToDelete) => {
    const nuevoCarrito = carrito.filter((_, index) => index !== indexToDelete);
    setCarrito(nuevoCarrito);
  }

  const generarPresupuesto = () => {
    if (!vehiculoId) {
      alert("⚠️ Por favor, ingresa el ID del vehículo primero.");
      return;
    }
    
    let descripcionAutomatica = carrito.map(item => item.nombre).join(" + ");
    if (!descripcionAutomatica) descripcionAutomatica = "Varios";

    const orden = {
      vehiculoId: parseInt(vehiculoId),
      descripcion: descripcionAutomatica,
      items: carrito.map(item => ({
        tipoServicio: { id: item.tipoServicio.id },
        cantidad: 1
      }))
    }

    fetch('http://localhost:8080/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orden)
    })
    .then(res => {
        if (!res.ok) throw new Error("Error en la petición");
        return res.json();
    })
    .then(data => setPresupuesto(data))
    .catch(err => alert("Error al cotizar. Revisa que el ID del auto exista."))
  }

  // --- LÓGICA NUEVA: AGRUPAR SERVICIOS ---
  // Convertimos la lista plana en un objeto agrupado por la propiedad "grupo"
  const serviciosAgrupados = servicios.reduce((acumulador, servicio) => {
    if (!servicio.descripcion || servicio.descripcion.trim() === "") return acumulador;
    
    // Si el servicio no tiene grupo, lo ponemos en "OTROS"
    const nombreGrupo = servicio.grupo ? servicio.grupo.toUpperCase() : "OTROS";
    
    if (!acumulador[nombreGrupo]) {
        acumulador[nombreGrupo] = []; // Creamos la lista para este grupo si no existe
    }
    acumulador[nombreGrupo].push(servicio); // Agregamos el servicio a su grupo
    
    return acumulador;
  }, {});

  // Función para abrir/cerrar un grupo específico
  const toggleGrupo = (nombreGrupo) => {
    setGruposExpandidos(prev => ({
        ...prev,
        [nombreGrupo]: !prev[nombreGrupo] // Si estaba true pasa a false, y viceversa
    }));
  }

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff', 
    color: '#333333',           
    width: '100%',
    fontSize: '16px'
  }

  return (
    <div style={{ color: '#333333' }}>
        
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#1e293b' }}>Nuevo Presupuesto</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Selecciona los servicios para cotizar.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* COLUMNA IZQUIERDA */}
          <div>
            <div className="card">
              <h3 style={{marginTop:0, color: '#1e40af'}}>🚗 Datos del Vehículo</h3>
              <input 
                type="number" 
                placeholder="Ingrese ID del Vehículo (Ej: 1)" 
                value={vehiculoId}
                onChange={(e) => setVehiculoId(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="card">
              <h3 style={{marginTop:0, color: '#1e40af', marginBottom: '15px'}}>🔧 Catálogo de Servicios</h3>
              
              <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                
                {/* --- AQUÍ RENDERIZAMOS LOS ACORDEONES --- */}
                {Object.keys(serviciosAgrupados).map((nombreGrupo) => (
                    <div key={nombreGrupo} style={{ marginBottom: '10px' }}>
                        
                        {/* CABECERA DEL GRUPO (Clickable) */}
                        <div 
                            onClick={() => toggleGrupo(nombreGrupo)}
                            style={{
                                backgroundColor: '#f1f5f9',
                                padding: '12px 15px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                border: '1px solid #e2e8f0',
                                transition: '0.2s'
                            }}
                        >
                            <span>{nombreGrupo} ({serviciosAgrupados[nombreGrupo].length})</span>
                            <span>{gruposExpandidos[nombreGrupo] ? '🔽' : '▶️'}</span>
                        </div>

                        {/* CONTENIDO DEL GRUPO (Se muestra solo si está expandido) */}
                        {gruposExpandidos[nombreGrupo] && (
                            <div style={{ padding: '10px', backgroundColor: '#fafafa', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                                <table style={{width: '100%'}}>
                                  <tbody>
                                    {serviciosAgrupados[nombreGrupo].map((s) => (
                                      <tr key={s.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                        <td style={{padding: '10px 5px', color:'#334155'}}>
                                            {s.descripcion}
                                        </td>
                                        <td style={{width: '100px', textAlign: 'right', padding: '10px 5px'}}>
                                          <button className="btn btn-add" onClick={() => agregarAlCarrito(s)} style={{padding: '6px 12px', fontSize: '0.9em'}}>
                                              + Agregar
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
                
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (Carrito se mantiene igual) */}
          <div>
            <div className="card" style={{ borderTop: '5px solid #3b82f6' }}>
              <h3 style={{marginTop:0, color: '#1e40af'}}>📋 Resumen</h3>
              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>El carrito está vacío</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {carrito.map((item, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.95em', color:'#334155' }}>{item.nombre}</span>
                      <button className="btn btn-danger" onClick={() => quitarDelCarrito(index)}>✖</button>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{marginTop: '20px'}}>
                  <button className="btn btn-primary" onClick={generarPresupuesto}>COTIZAR AHORA ➡️</button>
              </div>
            </div>
            
            {presupuesto && (
              <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign:'center' }}>
                <h2 style={{ color: '#166534', margin: '10px 0' }}>Total: ${presupuesto.costoTotal.toLocaleString()}</h2>
                <div style={{ background:'white', padding:'10px', borderRadius:'8px', marginTop:'10px', color: '#333'}}>
                  Vehículo: <strong>{presupuesto.vehiculo.modelo}</strong> <br/>
                  <small>Categoría: {presupuesto.vehiculo.categoria}</small>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default Cotizador