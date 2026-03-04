import { useEffect, useState } from 'react'

function Servicios() {
  const [servicios, setServicios] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')

  const [nuevoServicio, setNuevoServicio] = useState({
    grupo: 'OTROS',
    descripcion: '',
    precioA: '',
    precioB: ''
  })

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = () => {
    fetch('http://localhost:8080/api/servicios')
      .then(res => res.json())
      .then(data => setServicios(data))
      .catch(err => console.error(err))
  }

  const manejarGuardado = () => {
    if(!nuevoServicio.descripcion || !nuevoServicio.precioA) {
        alert("Por favor completa la Descripción y al menos el Precio Base");
        return;
    }

    const servicioAEnviar = {
        ...nuevoServicio,
        precioA: parseFloat(nuevoServicio.precioA) || 0,
        precioB: parseFloat(nuevoServicio.precioB) || 0
    };

    const url = modoEdicion ? `http://localhost:8080/api/servicios/${idEditar}` : 'http://localhost:8080/api/servicios';
    const metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicioAEnviar)
    })
    .then(async (res) => {
        // MAGIA DE DEBUGGING: Si Java dice "Fallo", leemos su respuesta exacta
        if (!res.ok) {
            const mensajeErrorBackend = await res.text();
            throw new Error(`Código ${res.status} - Detalle: ${mensajeErrorBackend}`);
        }
        return res.json(); // Si todo sale bien, seguimos normal
    })
    .then(() => {
        alert(modoEdicion ? "¡Precio actualizado!" : "¡Servicio creado!");
        terminarEdicion();
        cargarServicios();
    })
    .catch(err => {
        console.error("Error completo:", err);
        // Ahora la alerta nos dirá el motivo real
        alert("⚠️ FALLÓ EL SERVIDOR:\n\n" + err.message);
    });
  }

  const manejarActualizacion = () => {
    

    const url = modoEdicion ? `http://localhost:8080/api/servicios/${idEditar}` : 'http://localhost:8080/api/servicios';
    const metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoServicio)
    })
    .then(() => {
        alert(modoEdicion ? "¡Precio actualizado!" : "¡Servicio creado!");
        terminarEdicion();
        cargarServicios();
    })
  }

  const iniciarEdicion = (servicio) => {
    setModoEdicion(true);
    setIdEditar(servicio.id);
    setNuevoServicio({
        grupo: servicio.grupo || 'OTROS',
        descripcion: servicio.descripcion,
        precioA: servicio.precioA || 0,
        precioB: servicio.precioB || 0
    })
  }

  const eliminarServicio = (id) => {
    if(!confirm("¿Estás seguro de borrar este servicio del catálogo?")) return;
    fetch(`http://localhost:8080/api/servicios/${id}`, { method: 'DELETE' })
    .then(() => cargarServicios())
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoServicio({ grupo: 'OTROS', descripcion: '', precioA: '', precioB: '' });
  }

  // Extraemos todos los grupos únicos para el filtro
  const gruposDisponibles = ['TODOS', ...new Set(servicios.map(s => s.grupo).filter(Boolean))];

  const serviciosFiltrados = filtroGrupo === 'TODOS' 
    ? servicios 
    : servicios.filter(s => s.grupo === filtroGrupo);

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Catálogo de Servicios y Precios</h1>
      
      {/* FORMULARIO */}
      <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af' }}>{modoEdicion ? '✏️ Actualizar Precio/Servicio' : '➕ Nuevo Servicio'}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '15px' }}>
          <div>
              <label style={{fontSize:'0.85em', fontWeight:'bold'}}>Categoría (Grupo)</label>
              <input placeholder="Ej: FRENOS" value={nuevoServicio.grupo} onChange={e => setNuevoServicio({...nuevoServicio, grupo: e.target.value.toUpperCase()})} style={inputStyle} />
          </div>
          <div>
              <label style={{fontSize:'0.85em', fontWeight:'bold'}}>Descripción del Trabajo</label>
              <input placeholder="Ej: Cambio de pastillas delanteras" value={nuevoServicio.descripcion} onChange={e => setNuevoServicio({...nuevoServicio, descripcion: e.target.value})} style={inputStyle} />
          </div>
          <div>
              <label style={{fontSize:'0.85em', fontWeight:'bold', color: '#166534'}}>Precio A (Base) $</label>
              <input type="number" value={nuevoServicio.precioA} onChange={e => setNuevoServicio({...nuevoServicio, precioA: e.target.value})} style={{...inputStyle, border: '2px solid #bbf7d0'}} />
          </div>
          <div>
              <label style={{fontSize:'0.85em', fontWeight:'bold', color: '#b45309'}}>Precio B (Full) $</label>
              <input type="number" value={nuevoServicio.precioB} onChange={e => setNuevoServicio({...nuevoServicio, precioB: e.target.value})} style={{...inputStyle, border: '2px solid #fde047'}} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', flex: 1 }}>
                  {modoEdicion ? 'Guardar Cambios' : 'Agregar al Catálogo'}
              </button>
              {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', flex: 1 }}>Cancelar</button>}
          </div>
        </div>
      </div>

      {/* TABLA DE PRECIOS */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🏷️ Lista de Precios Actual</h3>
            
            {/* FILTRO POR CATEGORÍA */}
            <select 
                value={filtroGrupo} 
                onChange={(e) => setFiltroGrupo(e.target.value)}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
                {gruposDisponibles.map((grupo, idx) => (
                    <option key={idx} value={grupo}>{grupo}</option>
                ))}
            </select>
        </div>

        {serviciosFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No hay servicios en esta categoría.</p> : (
            <div style={{overflowX: 'auto', maxHeight: '500px', overflowY: 'auto'}}>
                <table style={{ width: '100%', minWidth: '700px' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Categoría</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Descripción</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Precio Base</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Precio Full</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {serviciosFiltrados.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        <td style={{ padding: '10px' }}>
                            <span style={{ fontWeight:'bold', color:'#3b82f6', fontSize:'0.85em' }}>{s.grupo}</span>
                        </td>
                        <td style={{ padding: '10px' }}>{s.descripcion}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>
                            ${s.precioA ? s.precioA.toLocaleString() : '0'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#b45309' }}>
                            ${s.precioB ? s.precioB.toLocaleString() : '0'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '5px 10px' }} onClick={() => iniciarEdicion(s)}>✏️</button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '5px 10px' }} onClick={() => eliminarServicio(s.id)}>🗑️</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  )
}

export default Servicios