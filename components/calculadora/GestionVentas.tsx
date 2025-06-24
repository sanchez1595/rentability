import React from 'react';
import { ShoppingCart, Trash2, Calendar } from 'lucide-react';
import { Producto, Venta, VentaActual } from '../../types';
import { formatearMoneda, formatearNumero } from '../../utils/formatters';

interface GestionVentasProps {
  productos: Producto[];
  ventas: Venta[];
  ventaActual: VentaActual;
  onActualizarVenta: (campo: keyof VentaActual, valor: string) => void;
  onRegistrarVenta: () => void;
  onEliminarVenta: (id: string) => void;
}

export const GestionVentas: React.FC<GestionVentasProps> = ({
  productos,
  ventas,
  ventaActual,
  onActualizarVenta,
  onRegistrarVenta,
  onEliminarVenta
}) => {
  const productoSeleccionado = productos.find(p => p.id === ventaActual.productoId);
  const totalVenta = (parseFloat(ventaActual.cantidad) || 0) * (parseFloat(ventaActual.precioVenta) || 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Registrar Nueva Venta
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Producto</label>
            <select
              value={ventaActual.productoId}
              onChange={(e) => {
                onActualizarVenta('productoId', e.target.value);
                const producto = productos.find(p => p.id === e.target.value);
                if (producto) {
                  onActualizarVenta('precioVenta', producto.precioVenta);
                }
              }}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Seleccionar producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - Stock: {producto.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad</label>
            <input
              type="number"
              value={ventaActual.cantidad}
              onChange={(e) => onActualizarVenta('cantidad', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0"
              min="1"
              max={productoSeleccionado ? productoSeleccionado.stock : undefined}
            />
            {productoSeleccionado && (
              <p className="text-sm text-slate-500 mt-1">
                Stock disponible: {productoSeleccionado.stock} unidades
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Precio de Venta</label>
            <input
              type="number"
              value={ventaActual.precioVenta}
              onChange={(e) => onActualizarVenta('precioVenta', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
            <input
              type="text"
              value={ventaActual.cliente}
              onChange={(e) => onActualizarVenta('cliente', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Nombre del cliente (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago</label>
            <select
              value={ventaActual.metodoPago}
              onChange={(e) => onActualizarVenta('metodoPago', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
            <input
              type="date"
              value={ventaActual.fecha}
              onChange={(e) => onActualizarVenta('fecha', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {totalVenta > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <p className="text-lg font-semibold text-emerald-800">
              Total de la venta: {formatearMoneda(totalVenta)}
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={onRegistrarVenta}
            disabled={!ventaActual.productoId || !ventaActual.cantidad}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Registrar Venta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial de Ventas
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Fecha</th>
                <th className="text-left p-4 font-medium text-slate-700">Producto</th>
                <th className="text-left p-4 font-medium text-slate-700">Cliente</th>
                <th className="text-left p-4 font-medium text-slate-700">Cantidad</th>
                <th className="text-left p-4 font-medium text-slate-700">Precio Unit.</th>
                <th className="text-left p-4 font-medium text-slate-700">Total</th>
                <th className="text-left p-4 font-medium text-slate-700">Método</th>
                <th className="text-left p-4 font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .map((venta) => {
                  const producto = productos.find(p => p.id === venta.productoId);
                  const total = (parseFloat(venta.cantidad) || 0) * (parseFloat(venta.precioVenta) || 0);
                  
                  return (
                    <tr key={venta.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-4 text-slate-900">
                        {new Date(venta.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {producto?.nombre || 'Producto eliminado'}
                      </td>
                      <td className="p-4 text-slate-600">{venta.cliente || 'N/A'}</td>
                      <td className="p-4 text-slate-900">{formatearNumero(venta.cantidad)}</td>
                      <td className="p-4 text-slate-900">{formatearMoneda(venta.precioVenta)}</td>
                      <td className="p-4 font-medium text-emerald-600">{formatearMoneda(total)}</td>
                      <td className="p-4 text-slate-600 capitalize">{venta.metodoPago}</td>
                      <td className="p-4">
                        <button
                          onClick={() => onEliminarVenta(venta.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          
          {ventas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No hay ventas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};