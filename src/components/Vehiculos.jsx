import { useEffect, useState } from 'react'

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [clientes, setClientes] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const [nuevoAuto, setNuevoAuto] = useState({
    patente: '',
    modelo: '',
    marca: '',
    anio: 2024,
    categoria: 'CATEGORIA_A',
    numeroMotor: '',
    numeroChasis: '',
    kilometraje: '',
    proximoServiceKm: '',
    cliente: null
  })

  useEffect(() => {
    cargarVehiculos()
    cargarClientes()
  }, [])

  const cargarVehiculos = () => {
    fetch('http://localhost:8080/api/vehiculos')
      .then(res => res.json())
      .then(data => setVehiculos(data))
      .catch(err => console.error(err))
  }

  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error(err))
  }

  const manejarGuardado = () => {
    if(!nuevoAuto.patente || !nuevoAuto.modelo) {
        alert("Por favor completa Patente y Modelo");
        return;
    }

    const url = modoEdicion ? `http://localhost:8080/api/vehiculos/${idEditar}` : 'http://localhost:8080/api/vehiculos';
    const metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoAuto)
    })
    .then(() => {
        alert(modoEdicion ? "¡Actualizado!" : "¡Guardado!");
        terminarEdicion();
        cargarVehiculos();
    })
  }

  const iniciarEdicion = (auto) => {
    setModoEdicion(true);
    setIdEditar(auto.id);
    setNuevoAuto({
        patente: auto.patente,
        modelo: auto.modelo,
        marca: auto.marca,
        anio: auto.anio,
        categoria: auto.categoria,
        numeroMotor: auto.numeroMotor || '',
        numeroChasis: auto.numeroChasis || '', 
        kilometraje: auto.kilometraje || '',
        proximoServiceKm: auto.proximoServiceKm || '',
        cliente: auto.cliente
    })
  }

  const eliminarVehiculo = (id) => {
    if(!confirm("¿Borrar vehículo?")) return;
    fetch(`http://localhost:8080/api/vehiculos/${id}`, { method: 'DELETE' })
    .then(() => cargarVehiculos())
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoAuto({ patente: '', modelo: '', marca: '', anio: 2024, categoria: 'CATEGORIA_A', numeroMotor: '', numeroChasis: '', kilometraje: '', proximoServiceKm: '', cliente: null });
  }

  const handleClienteChange = (e) => {
      const idSeleccionado = e.target.value;
      if (idSeleccionado === "") {
          setNuevoAuto({ ...nuevoAuto, cliente: null });
      } else {
          setNuevoAuto({ ...nuevoAuto, cliente: { id: parseInt(idSeleccionado) } });
      }
  }

  const calcularEstadoService = (kmActual, kmProximo) => {
      if (!kmActual || !kmProximo) return null;
      const diferencia = kmProximo - kmActual;
      if (diferencia <= 0) return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>🚨 ¡VENCIDO!</span>;
      if (diferencia <= 1000) return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>⚠️ Falta ({diferencia} km)</span>;
      return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>✅ Al día</span>;
  }

  // Lógica de filtrado (AHORA TAMBIÉN BUSCA POR ID)
  const vehiculosFiltrados = vehiculos.filter(v => {
      const termino = busqueda.toLowerCase();
      const idString = v.id.toString();
      const patente = (v.patente || '').toLowerCase();
      const nombreCliente = v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}`.toLowerCase() : '';
      return idString.includes(termino) || patente.includes(termino) || nombreCliente.includes(termino);
  });

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Gestión de Vehículos</h1>
      
      {/* FORMULARIO */}
      <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af' }}>{modoEdicion ? '✏️ Editar' : '➕ Nuevo Auto'}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'0.9em'}}>👤 Dueño del Auto:</label>
              <select style={inputStyle} value={nuevoAuto.cliente ? nuevoAuto.cliente.id : ""} onChange={handleClienteChange}>
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
          </div>

          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Patente</label><input value={nuevoAuto.patente} onChange={e => setNuevoAuto({...nuevoAuto, patente: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Marca</label><input value={nuevoAuto.marca} onChange={e => setNuevoAuto({...nuevoAuto, marca: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Modelo</label><input value={nuevoAuto.modelo} onChange={e => setNuevoAuto({...nuevoAuto, modelo: e.target.value})} style={inputStyle} /></div>
          <div>
              <label style={{fontSize:'0.85em', fontWeight:'bold'}}>Categoría</label>
              <select value={nuevoAuto.categoria} onChange={e => setNuevoAuto({...nuevoAuto, categoria: e.target.value})} style={inputStyle}>
                <option value="CATEGORIA_A">Cat. A (Base)</option>
                <option value="CATEGORIA_B">Cat. B (Full)</option>
                <option value="CATEGORIA_C">Cat. C (Camioneta)</option>
              </select>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e1', gridColumn: '1 / -1', margin: '10px 0', paddingTop: '10px' }}>
              <strong style={{color: '#475569'}}>📝 Tarjeta Verde y Control de Service</strong>
          </div>

          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>N° Motor</label><input placeholder="Ej: FMB123..." value={nuevoAuto.numeroMotor} onChange={e => setNuevoAuto({...nuevoAuto, numeroMotor: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>N° Chasis / VIN</label><input placeholder="Ej: 8AD123..." value={nuevoAuto.numeroChasis} onChange={e => setNuevoAuto({...nuevoAuto, numeroChasis: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>KM Actual</label><input type="number" placeholder="Ej: 150000" value={nuevoAuto.kilometraje} onChange={e => setNuevoAuto({...nuevoAuto, kilometraje: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold', color: '#1d4ed8'}}>Próximo Service (KM)</label><input type="number" placeholder="Ej: 160000" value={nuevoAuto.proximoServiceKm} onChange={e => setNuevoAuto({...nuevoAuto, proximoServiceKm: e.target.value})} style={{...inputStyle, border: '2px solid #93c5fd', backgroundColor: '#eff6ff'}} /></div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', flex: 1 }}>{modoEdicion ? 'Actualizar Vehículo' : 'Guardar Vehículo'}</button>
              {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', flex: 1 }}>Cancelar</button>}
          </div>
        </div>
      </div>

      {/* TABLA CON BUSCADOR */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🚗 Flota Actual</h3>
            
            <input 
                type="text" 
                placeholder="🔍 Buscar por ID, patente o dueño..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ ...inputStyle, width: '300px', border: '2px solid #3b82f6' }}
            />
        </div>

        {vehiculosFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No se encontraron vehículos.</p> : (
            <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', minWidth: '950px' }}>
                <thead>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px', width: '60px' }}>ID</th> {/* <--- AQUÍ VOLVIÓ EL ID */}
                        <th style={{ textAlign: 'left', padding: '10px' }}>Dueño</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Vehículo</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Control de KM</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Datos Técnicos</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {vehiculosFiltrados.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        {/* <--- AQUÍ SE MUESTRA EL ID EN AZUL ---> */}
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb', fontSize: '1.1em' }}>{v.id}</td>
                        
                        <td style={{ padding: '10px' }}>
                            {v.cliente ? <strong>👤 {v.cliente.nombre} {v.cliente.apellido}</strong> : <span style={{ color:'#999' }}>Sin asignar</span>}
                            {v.cliente && v.cliente.telefono && <div style={{fontSize:'0.8em', color:'#64748b'}}>📞 {v.cliente.telefono}</div>}
                        </td>
                        <td style={{ padding: '10px' }}>
                            <div style={{ background: '#1e293b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize:'0.85em', display: 'inline-block', marginBottom: '4px' }}>{v.patente}</div>
                            <div style={{ fontSize: '0.9em' }}>{v.marca} {v.modelo}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                {v.kilometraje ? <span><strong>Actual:</strong> {v.kilometraje.toLocaleString()} km</span> : <span style={{ color: '#94a3b8', fontSize: '0.85em' }}>Sin datos de KM</span>}
                            </div>
                            {calcularEstadoService(v.kilometraje, v.proximoServiceKm)}
                        </td>
                        <td style={{ padding: '10px', fontSize: '0.85em', color: '#475569' }}>
                            <div><strong>Motor:</strong> {v.numeroMotor || '-'}</div>
                            <div><strong>Chasis:</strong> {v.numeroChasis || '-'}</div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '5px 10px' }} onClick={() => iniciarEdicion(v)}>✏️</button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '5px 10px' }} onClick={() => eliminarVehiculo(v.id)}>🗑️</button>
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

export default Vehiculos