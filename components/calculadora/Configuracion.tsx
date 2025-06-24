import React from 'react';
import { Settings, Plus, Trash2, Target, AlertTriangle } from 'lucide-react';
import { Configuracion as ConfiguracionType, Metas, Alertas } from '../../types';
import { formatearInput, formatearMoneda } from '../../utils/formatters';

interface ConfiguracionProps {
  configuracion: ConfiguracionType;
  metas: Metas;
  alertas: Alertas;
  onActualizarConfiguracion: (config: Partial<ConfiguracionType>) => void;
  onActualizarMetas: (metas: Partial<Metas>) => void;
  onActualizarAlertas: (alertas: Partial<Alertas>) => void;
}

export const ConfiguracionComponent: React.FC<ConfiguracionProps> = ({
  configuracion,
  metas,
  alertas,
  onActualizarConfiguracion,
  onActualizarMetas,
  onActualizarAlertas
}) => {
  const actualizarCostoFijo = (key: string, valor: string) => {
    const nuevoValor = parseFloat(valor) || 0;
    onActualizarConfiguracion({
      costosFijos: {
        ...configuracion.costosFijos,
        [key]: nuevoValor
      }
    });
  };

  const actualizarHerramienta = (key: string, valor: string) => {
    const nuevoValor = parseFloat(valor) || 0;
    onActualizarConfiguracion({
      herramientas: {
        ...configuracion.herramientas,
        [key]: nuevoValor
      }
    });
  };

  const actualizarPorcentaje = (key: string, valor: string) => {
    const nuevoValor = parseFloat(valor) || 0;
    onActualizarConfiguracion({
      porcentajes: {
        ...configuracion.porcentajes,
        [key]: nuevoValor
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración General
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Costos Fijos Mensuales</h4>
            <div className="space-y-3">
              {Object.entries(configuracion.costosFijos).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="flex-1 text-sm text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <input
                    type="text"
                    value={formatearInput(value)}
                    onChange={(e) => actualizarCostoFijo(key, e.target.value)}
                    className="w-32 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">Herramientas y Software</h4>
            <div className="space-y-3">
              {Object.entries(configuracion.herramientas).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="flex-1 text-sm text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <input
                    type="text"
                    value={formatearInput(value)}
                    onChange={(e) => actualizarHerramienta(key, e.target.value)}
                    className="w-32 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">Porcentajes Operativos</h4>
            <div className="space-y-3">
              {Object.entries(configuracion.porcentajes).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="flex-1 text-sm text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => actualizarPorcentaje(key, e.target.value)}
                      className="w-20 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">Estimaciones</h4>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Ventas Estimadas Mensuales</label>
              <input
                type="number"
                value={configuracion.ventasEstimadas}
                onChange={(e) => onActualizarConfiguracion({ ventasEstimadas: parseFloat(e.target.value) || 0 })}
                className="w-32 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Usado para distribuir costos fijos entre productos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Metas del Negocio
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ventas Mensuales Objetivo
              </label>
              <input
                type="text"
                value={formatearInput(metas.ventasMensuales)}
                onChange={(e) => onActualizarMetas({ ventasMensuales: parseFloat(e.target.value.replace(/\D/g, '')) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="2,000,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unidades Mensuales Objetivo
              </label>
              <input
                type="number"
                value={metas.unidadesMensuales}
                onChange={(e) => onActualizarMetas({ unidadesMensuales: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Margen Promedio Objetivo (%)
              </label>
              <input
                type="number"
                value={metas.margenPromedio}
                onChange={(e) => onActualizarMetas({ margenPromedio: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="35"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rotación de Inventario Anual
              </label>
              <input
                type="number"
                value={metas.rotacionInventario}
                onChange={(e) => onActualizarMetas({ rotacionInventario: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="12"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Configuración de Alertas
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Margen Mínimo de Alerta (%)
              </label>
              <input
                type="number"
                value={alertas.margenMinimo}
                onChange={(e) => onActualizarAlertas({ margenMinimo: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="20"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Mínimo de Alerta
              </label>
              <input
                type="number"
                value={alertas.stockMinimo}
                onChange={(e) => onActualizarAlertas({ stockMinimo: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Días Sin Venta para Alerta
              </label>
              <input
                type="number"
                value={alertas.diasSinVenta}
                onChange={(e) => onActualizarAlertas({ diasSinVenta: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diferencia de Precio vs Competencia (%)
              </label>
              <input
                type="number"
                value={alertas.diferenciaPrecioCompetencia}
                onChange={(e) => onActualizarAlertas({ diferenciaPrecioCompetencia: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="15"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};