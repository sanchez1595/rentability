import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useProductos } from '../../hooks/useProductos';
import { useVentas } from '../../hooks/useVentas';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import { useNavegacion } from '../../hooks/useNavegacion';

import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { Dashboard } from './Dashboard';
import { GestionProductos } from './GestionProductos';
import { GestionVentas } from './GestionVentas';
import { ConfiguracionComponent } from './Configuracion';

export const BabyStoreCalculator = () => {
  const { configuracion, metas, alertas, actualizarConfiguracion, actualizarMetas, actualizarAlertas } = useConfiguracion();
  const { vistaActiva, sidebarOpen, cambiarVista, toggleSidebar } = useNavegacion();
  
  const {
    productos,
    productoActual,
    editandoId,
    manejarCambioInput,
    calcularPreciosProducto,
    agregarProducto,
    editarProducto,
    guardarEdicion,
    eliminarProducto,
    cancelarEdicion,
    setProductos
  } = useProductos(configuracion);

  const {
    ventas,
    ventaActual,
    registrarVenta: registrarVentaBase,
    actualizarVentaActual,
    eliminarVenta,
    setVentas
  } = useVentas();

  const registrarVenta = () => {
    const exito = registrarVentaBase(productos);
    if (exito) {
      // Actualizar stock del producto
      setProductos(prev => 
        prev.map(p => 
          p.id === ventaActual.productoId 
            ? { ...p, stock: (parseFloat(p.stock) - parseFloat(ventaActual.cantidad)).toString() }
            : p
        )
      );
    }
  };

  const renderVistaActiva = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <Dashboard productos={productos} ventas={ventas} />;
      
      case 'productos':
        return (
          <GestionProductos
            productos={productos}
            productoActual={productoActual}
            editandoId={editandoId}
            onCambioInput={manejarCambioInput}
            onCalcularPrecios={calcularPreciosProducto}
            onAgregarProducto={agregarProducto}
            onEditarProducto={editarProducto}
            onGuardarEdicion={guardarEdicion}
            onEliminarProducto={eliminarProducto}
            onCancelarEdicion={cancelarEdicion}
          />
        );
      
      case 'ventas':
        return (
          <GestionVentas
            productos={productos}
            ventas={ventas}
            ventaActual={ventaActual}
            onActualizarVenta={actualizarVentaActual}
            onRegistrarVenta={registrarVenta}
            onEliminarVenta={eliminarVenta}
          />
        );
      
      case 'configuracion':
        return (
          <ConfiguracionComponent
            configuracion={configuracion}
            metas={metas}
            alertas={alertas}
            onActualizarConfiguracion={actualizarConfiguracion}
            onActualizarMetas={actualizarMetas}
            onActualizarAlertas={actualizarAlertas}
          />
        );
      
      default:
        return <Dashboard productos={productos} ventas={ventas} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar
          vistaActiva={vistaActiva}
          sidebarOpen={sidebarOpen}
          onCambiarVista={cambiarVista}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex-1 md:ml-0">
          <Header onToggleSidebar={toggleSidebar} />
          
          <main className="p-6">
            {renderVistaActiva()}
          </main>
        </div>
      </div>
    </div>
  );
};