import React from 'react';
import { Edit2, Trash2, Save, X, Calculator, Plus } from 'lucide-react';
import { Producto, ProductoActual } from '../../types';
import { CATEGORIAS } from '../../utils/constants';
import { formatearInput, formatearMoneda } from '../../utils/formatters';

interface GestionProductosProps {
  productos: Producto[];
  productoActual: ProductoActual;
  editandoId: string | null;
  onCambioInput: (campo: keyof ProductoActual, valor: string) => void;
  onCalcularPrecios: () => void;
  onAgregarProducto: () => void;
  onEditarProducto: (id: string) => void;
  onGuardarEdicion: () => void;
  onEliminarProducto: (id: string) => void;
  onCancelarEdicion: () => void;
}

export const GestionProductos: React.FC<GestionProductosProps> = ({
  productos,
  productoActual,
  editandoId,
  onCambioInput,
  onCalcularPrecios,
  onAgregarProducto,
  onEditarProducto,
  onGuardarEdicion,
  onEliminarProducto,
  onCancelarEdicion
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
            <input
              type="text"
              value={productoActual.nombre}
              onChange={(e) => onCambioInput('nombre', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <select
              value={productoActual.categoria}
              onChange={(e) => onCambioInput('categoria', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Costo de Compra</label>
            <input
              type="text"
              value={formatearInput(productoActual.costoCompra)}
              onChange={(e) => onCambioInput('costoCompra', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gastos Fijos</label>
            <input
              type="text"
              value={formatearInput(productoActual.gastosFijos)}
              onChange={(e) => onCambioInput('gastosFijos', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Margen Deseado (%)</label>
            <input
              type="number"
              value={productoActual.margenDeseado}
              onChange={(e) => onCambioInput('margenDeseado', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Stock</label>
            <input
              type="number"
              value={productoActual.stock}
              onChange={(e) => onCambioInput('stock', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={onCalcularPrecios}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Calcular Precios
          </button>

          {productoActual.precioVenta && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">Precio de Venta:</span>
              <span className="font-semibold text-emerald-600">
                {formatearMoneda(productoActual.precioVenta)}
              </span>
              <span className="text-slate-600">Utilidad:</span>
              <span className="font-semibold text-emerald-600">
                {formatearMoneda(productoActual.utilidad)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4">
          {editandoId ? (
            <>
              <button
                onClick={onGuardarEdicion}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
              <button
                onClick={onCancelarEdicion}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={onAgregarProducto}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Lista de Productos</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Producto</th>
                <th className="text-left p-4 font-medium text-slate-700">Categoría</th>
                <th className="text-left p-4 font-medium text-slate-700">Costo</th>
                <th className="text-left p-4 font-medium text-slate-700">Precio Venta</th>
                <th className="text-left p-4 font-medium text-slate-700">Utilidad</th>
                <th className="text-left p-4 font-medium text-slate-700">Stock</th>
                <th className="text-left p-4 font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{producto.nombre}</td>
                  <td className="p-4 text-slate-600 capitalize">{producto.categoria}</td>
                  <td className="p-4 text-slate-900">{formatearMoneda(producto.costoCompra)}</td>
                  <td className="p-4 text-slate-900">{formatearMoneda(producto.precioVenta)}</td>
                  <td className="p-4 text-emerald-600 font-medium">{formatearMoneda(producto.utilidad)}</td>
                  <td className="p-4 text-slate-900">{producto.stock}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditarProducto(producto.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminarProducto(producto.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {productos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No hay productos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};