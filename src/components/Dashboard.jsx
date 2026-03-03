import { useEffect, useState } from 'react'

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    trabajosPendientes: 0,
    totalFacturado: 0,
    clientesRegistrados: 0,
    vehiculosFlota: 0,
    alertasService: []
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Pedimos todos los datos al mismo tiempo
      const [resOrdenes, resVehiculos, resClientes] = await Promise.all([
        fetch('http://localhost:8080/api/ordenes'),
        fetch('http://localhost:8080/api/vehiculos'),
        fetch('http://localhost:8080/api/clientes')
      ]);

      const ordenes = await resOrdenes.json();
      const vehiculos = await resVehiculos.json();
      const clientes = await resClientes.json();

      // --- CALCULOS ---
      // 1. Trabajos Pendientes (Todo lo que no sea FINALIZADO o ENTREGADO)
      const pendientes = ordenes.filter(o => o.estado !== 'FINALIZADO' && o.estado !== 'ENTREGADO').length;

      // 2. Total Facturado (Sumamos la plata de los trabajos ya listos)
      const facturado = ordenes
        .filter(o => o.estado === 'FINALIZADO' || o.estado === 'ENTREGADO')
        .reduce((sum, o) => sum + (o.costoTotal || 0), 0);

      // 3. Alertas de Service (Autos que están a 1000km o menos de pasarse)
      const alertas = vehiculos.filter(v => {
        if (!v.kilometraje || !v.proximoServiceKm) return false;
        const dif = v.proximoServiceKm - v.kilometraje;
        return dif <= 1000;
      });

      setEstadisticas({
        trabajosPendientes: pendientes,
        totalFacturado: facturado,
        clientesRegistrados: clientes.length,
        vehiculosFlota: vehiculos.length,
        alertasService: alertas
      });

      setCargando(false);
    } catch (error) {
      console.error("Error cargando el Dashboard:", error);
      setCargando(false);
    }
  };

  const tarjetaStyle = {
    background: 'white', padding: '20px', borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', justifyContent: 'center'
  };

  if (cargando) return <div style={{textAlign: 'center', marginTop: '50px', color: '#64748b'}}>Cargando resumen... ⏳</div>;

  return (
    <div style={{ color: '#333' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2em' }}>👋 ¡Hola, Nestor!</h1>
        <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '1.1em' }}>Este es el resumen de tu taller al día de hoy.</p>
      </header>

      {/* GRILLA DE ESTADÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div style={{...tarjetaStyle, borderBottom: '4px solid #f59e0b'}}>
          <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase' }}>🔧 Autos en el Taller</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>
            {estadisticas.trabajosPendientes}
          </div>
        </div>

        <div style={{...tarjetaStyle, borderBottom: '4px solid #10b981'}}>
          <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase' }}>💵 Facturado (Listos)</div>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold', color: '#166534', marginTop: '10px' }}>
            ${estadisticas.totalFacturado.toLocaleString()}
          </div>
        </div>

        <div style={{...tarjetaStyle, borderBottom: '4px solid #3b82f6'}}>
          <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase' }}>👥 Clientes Totales</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>
            {estadisticas.clientesRegistrados}
          </div>
        </div>

        <div style={{...tarjetaStyle, borderBottom: '4px solid #8b5cf6'}}>
          <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase' }}>🚗 Flota Registrada</div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>
            {estadisticas.vehiculosFlota}
          </div>
        </div>

      </div>

      {/* SECCIÓN DE ALERTAS */}
      <div className="card" style={{ border: '1px solid #fecaca', background: '#fff5f5' }}>
        <h3 style={{ marginTop: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🚨 Oportunidades de Service ({estadisticas.alertasService.length})
        </h3>
        <p style={{ color: '#7f1d1d', margin: '0 0 15px 0', fontSize: '0.9em' }}>
          Estos vehículos están a punto de pasarse del kilometraje o ya están vencidos. ¡Ideal para mandarles un mensaje!
        </p>

        {estadisticas.alertasService.length === 0 ? (
           <div style={{ padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>
               ¡Todos los vehículos están al día! ✅
           </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #fca5a5' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Cliente / Teléfono</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Vehículo</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Estado de KM</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.alertasService.map(v => {
                  const dif = v.proximoServiceKm - v.kilometraje;
                  const textoAlerta = dif <= 0 ? "¡VENCIDO!" : `Faltan ${dif} km`;
                  const colorAlerta = dif <= 0 ? '#ef4444' : '#f59e0b';

                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #fecaca' }}>
                      <td style={{ padding: '10px' }}>
                        <strong>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Sin dueño'}</strong>
                        {v.cliente && v.cliente.telefono && <div style={{ fontSize: '0.85em', color: '#64748b' }}>📞 {v.cliente.telefono}</div>}
                      </td>
                      <td style={{ padding: '10px' }}>{v.marca} {v.modelo} ({v.patente})</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: colorAlerta }}>
                        {textoAlerta}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard