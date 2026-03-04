import { useEffect, useState } from 'react'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [busqueda, setBusqueda] = useState('') 
  
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error("Error cargando clientes:", err))
  }

  const manejarGuardado = () => {
    if(!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.telefono) {
        alert("Por favor completa Nombre, Apellido y Teléfono");
        return;
    }

    const url = modoEdicion ? `http://localhost:8080/api/clientes/${idEditar}` : 'http://localhost:8080/api/clientes';
    const metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
    })
    .then(async (res) => {
        if (!res.ok) {
            const textoError = await res.text();
            throw new Error(textoError || "Error en el servidor al guardar el cliente.");
        }
        alert(modoEdicion ? "¡Cliente actualizado!" : "¡Cliente guardado!");
        terminarEdicion();
        cargarClientes();
    })
    .catch(err => alert("⚠️ No se pudo guardar:\n\n" + err.message))
  }

  const eliminarCliente = (id) => {
    if(!confirm("¿Borrar este cliente?\n\nOJO: Si el cliente tiene vehículos registrados, el sistema no te dejará borrarlo.")) return;
    
    fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'DELETE' })
    .then(async (res) => {
        if (!res.ok) {
            throw new Error("No se puede borrar. Es casi seguro que este cliente tiene vehículos u órdenes de trabajo asociados en el sistema.");
        }
        cargarClientes();
        alert("Cliente eliminado correctamente.");
    })
    .catch(err => alert("⚠️ Error al borrar:\n\n" + err.message))
  }

  const iniciarEdicion = (cliente) => {
    setModoEdicion(true);
    setIdEditar(cliente.id);
    setNuevoCliente({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email || '' 
    })
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoCliente({ nombre: '', apellido: '', telefono: '', email: '' });
  }

  const clientesFiltrados = clientes.filter(c => {
      const termino = busqueda.toLowerCase();
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
      const tel = (c.telefono || '').toLowerCase();
      return nombreCompleto.includes(termino) || tel.includes(termino);
  });

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Gestión de Clientes</h1>
      
      {/* FORMULARIO */}
      <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af' }}>{modoEdicion ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input placeholder="Nombre" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} style={inputStyle} />
          <input placeholder="Apellido" value={nuevoCliente.apellido} onChange={e => setNuevoCliente({...nuevoCliente, apellido: e.target.value})} style={inputStyle} />
          <input placeholder="Teléfono (Ej: 11-1234-5678)" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} style={inputStyle} />
          <input placeholder="Email (Opcional)" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} style={inputStyle} />
          
          <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', width: '100%' }}>{modoEdicion ? 'Actualizar' : 'Guardar'}</button>
          {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', width: '100%' }}>Cancelar</button>}
        </div>
      </div>

      {/* TABLA CON BUSCADOR */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>👥 Cartera de Clientes</h3>
            
            <input 
                type="text" 
                placeholder="🔍 Buscar por nombre o teléfono..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ ...inputStyle, width: '300px', border: '2px solid #3b82f6' }}
            />
        </div>

        {clientesFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No se encontraron clientes.</p> : (
            <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Nombre</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Contacto</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientesFiltrados.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.nombre} {c.apellido}</td>
                        <td style={{ padding: '10px' }}>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '15px', fontSize: '0.9em', display:'inline-flex', alignItems:'center', gap:'5px' }}>
                               📞 {c.telefono}
                            </span>
                        </td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{c.email || '-'}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '5px 10px', minWidth: 'auto' }} onClick={() => iniciarEdicion(c)}>✏️</button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '5px 10px', minWidth: 'auto' }} onClick={() => eliminarCliente(c.id)}>🗑️</button>
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

export default Clientes