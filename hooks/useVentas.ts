import { useState, useCallback } from 'react';
import { Venta, VentaActual, Producto } from '../types';
import { VENTA_INICIAL } from '../utils/constants';

export const useVentas = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventaActual, setVentaActual] = useState<VentaActual>(VENTA_INICIAL);

  const registrarVenta = useCallback((productos: Producto[]) => {
    if (!ventaActual.productoId || !ventaActual.cantidad) return false;

    const producto = productos.find(p => p.id == ventaActual.productoId);
    if (!producto) return false;

    const cantidad = parseFloat(ventaActual.cantidad) || 0;
    const stockActual = parseFloat(producto.stock) || 0;

    if (cantidad > stockActual) {
      alert(`No hay suficiente stock. Stock disponible: ${stockActual}`);
      return false;
    }

    const nuevaVenta: Venta = {
      ...ventaActual,
      id: Date.now().toString(),
      producto: producto,
      total: cantidad * (parseFloat(ventaActual.precioVenta) || 0)
    };

    setVentas(prev => [...prev, nuevaVenta]);
    setVentaActual(VENTA_INICIAL);
    return true;
  }, [ventaActual]);

  const actualizarVentaActual = useCallback((campo: keyof VentaActual, valor: string) => {
    setVentaActual(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  const eliminarVenta = useCallback((id: string) => {
    setVentas(prev => prev.filter(v => v.id !== id));
  }, []);

  return {
    ventas,
    ventaActual,
    registrarVenta,
    actualizarVentaActual,
    eliminarVenta,
    setVentas
  };
};