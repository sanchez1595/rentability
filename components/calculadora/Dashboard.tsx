import React from 'react';
import { TrendingUp, DollarSign, Package, BarChart3, Target, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Producto, Venta } from '../../types';
import { formatearNumero, formatearMoneda } from '../../utils/formatters';
import { calcularIngresosReales30Dias, obtenerTendenciaVentas, calcularMargenPromedio, calcularStockTotal, calcularValorInventario } from '../../utils/calculations';

interface DashboardProps {
  productos: Producto[];
  ventas: Venta[];
}

export const Dashboard: React.FC<DashboardProps> = ({ productos, ventas }) => {
  const ingresosReales = calcularIngresosReales30Dias(ventas);
  const tendencia = obtenerTendenciaVentas(ventas);
  const margenPromedio = calcularMargenPromedio(productos);
  const stockTotal = calcularStockTotal(productos);
  const valorInventario = calcularValorInventario(productos);

  const ventasEsteMes = ventas.filter(venta => {
    const fechaVenta = new Date(venta.fecha);
    const hoy = new Date();
    return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear();
  }).length;

  const estadisticas = [
    {
      titulo: 'Ingresos Últimos 30 Días',
      valor: formatearMoneda(ingresosReales),
      icono: DollarSign,
      color: 'emerald',
      tendencia: tendencia.cambio > 0 ? 'up' : tendencia.cambio < 0 ? 'down' : 'stable',
      porcentajeTendencia: Math.abs(tendencia.cambio).toFixed(1)
    },
    {
      titulo: 'Productos Registrados',
      valor: productos.length.toString(),
      icono: Package,
      color: 'blue',
      tendencia: 'stable',
      porcentajeTendencia: '0'
    },
    {
      titulo: 'Ventas Este Mes',
      valor: ventasEsteMes.toString(),
      icono: BarChart3,
      color: 'purple',
      tendencia: 'stable',
      porcentajeTendencia: '0'
    },
    {
      titulo: 'Margen Promedio',
      valor: `${margenPromedio.toFixed(1)}%`,
      icono: Target,
      color: 'orange',
      tendencia: 'stable',
      porcentajeTendencia: '0'
    }
  ];

  const mejoresProductos = productos
    .sort((a, b) => {
      const utilidadA = parseFloat(a.utilidad) || 0;
      const utilidadB = parseFloat(b.utilidad) || 0;
      return utilidadB - utilidadA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((stat, index) => {
          const Icon = stat.icono;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.titulo}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.valor}</p>
                  <div className="flex items-center mt-2">
                    {stat.tendencia === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />}
                    {stat.tendencia === 'down' && <ArrowDown className="w-4 h-4 text-red-500 mr-1" />}
                    <span className={`text-sm ${
                      stat.tendencia === 'up' ? 'text-emerald-600' : 
                      stat.tendencia === 'down' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {stat.porcentajeTendencia}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Productos Más Rentables</h3>
          <div className="space-y-3">
            {mejoresProductos.map((producto, index) => (
              <div key={producto.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{producto.nombre}</p>
                  <p className="text-sm text-slate-600">{producto.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    {formatearMoneda(producto.utilidad)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {((parseFloat(producto.utilidad) / parseFloat(producto.precioVenta)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen de Inventario</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total de Productos</span>
              <span className="font-semibold">{productos.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Stock Total</span>
              <span className="font-semibold">{formatearNumero(stockTotal)} unidades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Valor del Inventario</span>
              <span className="font-semibold text-emerald-600">{formatearMoneda(valorInventario)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Margen Promedio</span>
              <span className="font-semibold">{margenPromedio.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};