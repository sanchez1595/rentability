import { useState, useCallback } from 'react';
import { Producto, ProductoActual } from '../types';
import { PRODUCTO_INICIAL } from '../utils/constants';
import { calcularPrecios } from '../utils/calculations';

export const useProductos = (configuracion: any) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoActual, setProductoActual] = useState<ProductoActual>(PRODUCTO_INICIAL);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const manejarCambioInput = useCallback((campo: keyof ProductoActual, valor: string) => {
    setProductoActual(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  const calcularPreciosProducto = useCallback(() => {
    const { precioVenta, utilidad } = calcularPrecios(productoActual, configuracion);
    
    setProductoActual(prev => ({
      ...prev,
      precioVenta: precioVenta.toString(),
      utilidad: utilidad.toString()
    }));
  }, [productoActual, configuracion]);

  const agregarProducto = useCallback(() => {
    if (!productoActual.nombre || !productoActual.costoCompra) return;

    const nuevoProducto: Producto = {
      ...productoActual,
      id: Date.now().toString()
    };

    setProductos(prev => [...prev, nuevoProducto]);
    setProductoActual(PRODUCTO_INICIAL);
  }, [productoActual]);

  const editarProducto = useCallback((id: string) => {
    const producto = productos.find(p => p.id === id);
    if (producto) {
      setProductoActual(producto);
      setEditandoId(id);
    }
  }, [productos]);

  const guardarEdicion = useCallback(() => {
    if (!editandoId) return;

    setProductos(prev => 
      prev.map(p => p.id === editandoId ? { ...productoActual, id: editandoId } : p)
    );
    setProductoActual(PRODUCTO_INICIAL);
    setEditandoId(null);
  }, [editandoId, productoActual]);

  const eliminarProducto = useCallback((id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  }, []);

  const cancelarEdicion = useCallback(() => {
    setProductoActual(PRODUCTO_INICIAL);
    setEditandoId(null);
  }, []);

  return {
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
  };
};